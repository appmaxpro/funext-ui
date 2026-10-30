import { escapeRegExp } from "../names";
import { shallowEqual } from "../shallowEqual";
import { AstType, type ArrayLiteral, type AstNode } from "../parser/ast";
import { deepClone } from "../objects";
import { evaluate, parse } from "../parser";
import { EMPTY_OBJECT } from "../constant";

/**
 * @typedef {import("./py_js/py_parser").AST} AST
 * @typedef {[string | 0 | 1, string, any]} Condition
 * @typedef {("&" | "|" | "!" | Condition)[]} DomainListRepr
 * @typedef {DomainListRepr | string | Domain} DomainRepr
 */

type Condition = [string | 0 | 1, string, any];
type DomainListRepr = (string | Condition)[];
type DomainRepr = DomainListRepr | string | Domain;

/** @type {Condition} */
const TRUE_LEAF = [1, "=", 1] as Condition;
/** @type {Condition} */
const FALSE_LEAF = [0, "=", 1] as Condition;

export class InvalidDomainError extends Error {}

/**
 * Javascript representation of an Odoo domain
 */
export class Domain {
  /**
   * Combine various domains together with a given operator
   * @param {DomainRepr[]} domains
   * @param {"AND" | "OR"} operator
   * @returns {Domain}
   */
  static combine(domains: DomainRepr[], operator: "AND" | "OR") {
    if (domains.length === 0) {
      return new Domain([]);
    }
    const domain1 =
      domains[0] instanceof Domain ? domains[0] : new Domain(domains[0]);
    if (domains.length === 1) {
      return domain1;
    }
    const domain2 = Domain.combine(domains.slice(1), operator);
    const result = new Domain([]);
    const astValues1 = domain1.ast.value;
    const astValues2 = domain2.ast.value;
    const op = operator === "AND" ? "&" : "|";
    const combinedAST = {
      type: 4 /* List */,
      value: astValues1.concat(astValues2),
    };
    result.ast = normalizeDomainAST(combinedAST, op);
    return result;
  }

  /**
   * Combine various domains together with `AND` operator
   * @param {DomainRepr[]} domains
   * @returns {Domain}
   */
  static and(domains: DomainRepr[]) {
    return Domain.combine(domains, "AND");
  }

  /**
   * Combine various domains together with `OR` operator
   * @param {DomainRepr[]} domains
   * @returns {Domain}
   */
  static or(domains: DomainRepr[]) {
    return Domain.combine(domains, "OR");
  }

  /**
   * Return the negation of the domain
   * @returns {Domain}
   */
  static not(domain: DomainRepr) {
    const result = new Domain(domain);
    result.ast.value.unshift({ type: 1, value: "!" });
    return result;
  }

  /**
   * Return a new domain with `neutralized` leaves (for the leaves that are applied on the field that are part of
   * keysToRemove).
   * @param {DomainRepr} domain
   * @param {string[]} keysToRemove
   * @return {Domain}
   */
  static removeDomainLeaves(domain: DomainRepr, keysToRemove: string[]) {
    function processLeaf(
      elements: AstNode[],
      idx: number,
      operatorCtx: string,
      newDomain: Domain,
    ): number {
      elements = [...elements];
      const leaf = elements[idx];
      if (
        leaf.type === AstType.ArrayLiteral /* list */ &&
        leaf.value.length === 3 &&
        leaf.value[0].type === AstType.StringLiteral /* String */
      ) {
        if (keysToRemove.includes(leaf.value[0].value)) {
          if (operatorCtx === "&") {
            newDomain.ast!.value.push(...Domain.TRUE.ast.value);
          } else if (operatorCtx === "|") {
            newDomain.ast!.value.push(...Domain.FALSE.ast.value);
          }
        } else {
          newDomain.ast!.value.push(leaf);
        }
        return 1;
      } else if (leaf.type === AstType.StringLiteral) {
        // Special case to avoid OR ('|') that can never resolve to true
        if (
          leaf.value === "|" &&
          elements[idx + 1].type === AstType.ArrayLiteral &&
          elements[idx + 2].type === AstType.ArrayLiteral &&
          // @ts-ignore
          keysToRemove.includes(elements[idx + 1].value[0]?.value) &&
          // @ts-ignore
          keysToRemove.includes(elements[idx + 2].value[0]?.value)
        ) {
          
          newDomain.ast!.value.push(...Domain.TRUE.ast!.value);
          return 3;
        }
        newDomain.ast!.value.push(leaf);
        if (leaf.value === "!") {
          return 1 + processLeaf(elements, idx + 1, "&", newDomain);
        }
        const firstLeafSkip = processLeaf(
          elements,
          idx + 1,
          leaf.value,
          newDomain,
        );
        const secondLeafSkip = processLeaf(
          elements,
          idx + 1 + firstLeafSkip,
          leaf.value,
          newDomain,
        );
        return 1 + firstLeafSkip + secondLeafSkip;
      }
      return 0;
    }

    domain = new Domain(domain);
    if (domain.ast!.value.length === 0) {
      return domain;
    }
    const newDomain = new Domain([]);
    processLeaf(domain.ast!.value, 0, "&", newDomain);
    return newDomain;
  }

  ast: ArrayLiteral;

  /**
   * @param {DomainRepr} [descr]
   */
  constructor(descr: DomainRepr = []) {
    if (descr instanceof Domain) {
      /** @type {AST} */
      this.ast = deepClone(descr.ast) as ArrayLiteral;
    } else {
      let rawAST;
      try {
        rawAST = typeof descr === "string" ? parse(descr) : toAST(descr);
      } catch (error) {
        throw new InvalidDomainError(
          `Invalid domain representation: ${descr.toString()}`,
          {
            cause: error,
          },
        );
      }
      this.ast = normalizeDomainAST(rawAST) as ArrayLiteral;
    }
  }

  /**
   * Check if the set of records represented by a domain contains a record
   * Warning: smart dates (see parseSmartDateInput) are not handled here.
   *
   * @param {Object} record
   * @returns {boolean}
   */
  contains(record: Record<string, any>) {
    const expr = this.toList(record);
    return matchDomain(record, expr);
  }

  /**
   * @returns {string}
   */
  toString() {
    return formatAST(this.ast);
  }

  /**
   * @param {Object} context
   * @returns {DomainListRepr}
   */
  toList(context: Record<string, any> = EMPTY_OBJECT) {
    return evaluate(this.ast, context) as DomainListRepr;
  }

  /**
   * Converts the domain into a human-readable format for JSON representation.
   * If the domain does not contain any contextual value, it is converted to a list.
   * Otherwise, it is returned as a string.
   *
   * The string format is less readable due to escaped double quotes.
   * Example: "[\"&\",[\"user_id\",\"=\",uid],[\"team_id\",\"!=\",false]]"
   * @returns {DomainListRepr | string}
   */
  toJson() {
    try {
      // Attempt to evaluate the domain without context
      const evaluatedAsList = this.toList({});
      const evaluatedDomain = new Domain(evaluatedAsList);
      if (evaluatedDomain.toString() === this.toString()) {
        return evaluatedAsList;
      }
      return this.toString();
    } catch {
      // The domain couldn't be evaluated due to contextual values
      return this.toString();
    }
  }

  static TRUE = new Domain(TRUE_LEAF);
  static FALSE = new Domain(FALSE_LEAF);
}

type DomainAstType =
  | AstType.StringLiteral
  | AstType.NumberLiteral
  | AstType.BooleanLiteral
  | AstType.NullLiteral
  | AstType.ArrayLiteral;
// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
/**
 * @param {DomainListRepr} domain
 * @returns {AST}
 */
function toAST(
  value: string | number | boolean | null | DomainListRepr,
): AstNode {
  if (typeof value === "string") {
    return { type: AstType.StringLiteral /* String */, value };
  }
  if (typeof value === "number") {
    return { type: AstType.NumberLiteral /* Number */, value };
  }
  if (typeof value === "boolean") {
    return { type: AstType.BooleanLiteral /* Boolean */, value };
  }
  if (value === null) {
    return { type: AstType.NullLiteral /* Null */, value };
  }
  if (Array.isArray(value)) {
    return {
      type: AstType.ArrayLiteral /* List */,
      value: value.map(toAST),
    };
  }
  throw new InvalidDomainError(`Invalid domain value: ${value}`);
}

/**
 * Normalizes a domain
 *
 * @param {AST} domain
 * @param {'&' | '|'} [op]
 * @returns {AST}
 */

function normalizeDomainAST(
  domain: AstNode,
  op: "&" | "|" = "&",
): ArrayLiteral {
  if (domain.type !== AstType.ArrayLiteral /* List */) {
    throw new InvalidDomainError("Invalid domain AST (should be a list)");
  }

  const value = domain.value;
  /* Tuple contains at least one Tuple and optionally string */
  if (
    value.findIndex((e) => e.type === AstType.ArrayLiteral) === -1 ||
    !value.every(
      (e) =>
        e.type === AstType.ArrayLiteral || e.type === AstType.StringLiteral,
    )
  ) {
    throw new InvalidDomainError("Invalid domain AST");
  }

  if (domain.value.length === 0) {
    return domain;
  }
  let expected = 1;
  for (const child of domain.value) {
    switch (child.type) {
      case AstType.StringLiteral:
        if (child.value === "&" || child.value === "|") {
          expected++;
        } else if (child.value !== "!") {
          throw new InvalidDomainError("Invalid domain AST");
        }
        break;
      case AstType.ArrayLiteral /* list */:
        if (child.value.length === 3) {
          expected--;
          break;
        }
        throw new InvalidDomainError("Invalid domain AST");
      default:
        throw new InvalidDomainError("Invalid domain AST");
    }
  }
  const values = domain.value.slice();
  while (expected < 0) {
    expected++;
    values.unshift({ type: AstType.StringLiteral /* String */, value: op });
  }
  if (expected > 0) {
    throw new InvalidDomainError(
      `invalid domain ${formatAST(domain)} (missing ${expected} segment(s))`,
    );
  }
  return { type: AstType.ArrayLiteral /* List */, value: values };
}

function formatAST(ast: AstNode): string {
  if (ast.type === AstType.StringLiteral) {
    return `"${ast.value.replace(/"/g, '\\"')}"`;
  }
  if (
    ast.type === AstType.NumberLiteral ||
    ast.type === AstType.BooleanLiteral ||
    ast.type === AstType.NullLiteral
  ) {
    return String(ast.value);
  }
  if (ast.type === AstType.ArrayLiteral) {
    return `[${ast.value.map(formatAST).join(",")}]`;
  }
  throw new InvalidDomainError("Invalid domain AST");
}

/**
 * @param {Object} record
 * @param {Condition | boolean} condition
 * @returns {boolean}
 */
function matchCondition(
  record: Record<string, any>,
  condition: Condition | boolean,
): boolean {
  if (typeof condition === "boolean") {
    return condition;
  }
  const [field, operator, value] = condition;

  if (typeof field === "string") {
    const names = field.split(".");
    if (names.length >= 2) {
      return matchCondition(record[names[0]], [
        names.slice(1).join("."),
        operator,
        value,
      ]);
    }
  }
  let likeRegexp, ilikeRegexp;
  if (["like", "not like", "ilike", "not ilike"].includes(operator)) {
    likeRegexp = new RegExp(
      `(.*)${escapeRegExp(value).replaceAll("%", "(.*)")}(.*)`,
      "g",
    );
    ilikeRegexp = new RegExp(
      `(.*)${escapeRegExp(value).replaceAll("%", "(.*)")}(.*)`,
      "gi",
    );
  }
  const fieldValue = typeof field === "number" ? field : record[field];
  const isNot = operator.startsWith("not ");
  switch (operator) {
    case "=?":
      if ([false, null].includes(value)) {
        return true;
      }
    // eslint-disable-next-line no-fallthrough
    case "=":
    case "==":
      if (Array.isArray(fieldValue) && Array.isArray(value)) {
        return shallowEqual(fieldValue, value);
      }
      return fieldValue === value;
    case "!=":
    case "<>":
      return !matchCondition(record, [field, "=", value]);
    case "<":
      return fieldValue < value;
    case "<=":
      return fieldValue <= value;
    case ">":
      return fieldValue > value;
    case ">=":
      return fieldValue >= value;
    case "in":
    case "not in": {
      const val = Array.isArray(value) ? value : [value];
      const fieldVal = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      return Boolean(fieldVal.some((fv) => val.includes(fv))) != isNot;
    }
    case "like":
    case "not like":
      if (fieldValue === false) {
        return isNot;
      }
      return Boolean(fieldValue.match(likeRegexp)) != isNot;
    case "=like":
    case "not =like":
      if (fieldValue === false) {
        return isNot;
      }
      return (
        Boolean(
          new RegExp(escapeRegExp(value).replace(/%/g, ".*")).test(fieldValue),
        ) != isNot
      );
    case "ilike":
    case "not ilike":
      if (fieldValue === false) {
        return isNot;
      }
      return Boolean(fieldValue.match(ilikeRegexp)) != isNot;
    case "=ilike":
    case "not =ilike":
      if (fieldValue === false) {
        return isNot;
      }
      return (
        Boolean(
          new RegExp(escapeRegExp(value).replace(/%/g, ".*"), "i").test(
            fieldValue,
          ),
        ) != isNot
      );
    case "any":
    case "not any":
      return true;
    case "child_of":
    case "parent_of":
      return true;
  }
  throw new InvalidDomainError("could not match domain");
}

/**
 * @param {Object} record
 * @returns {Object}
 */
function makeOperators(record: Record<string, any>) {
  const match = matchCondition.bind(null, record);
  return {
    "!": (x: any) => !match(x),
    "&": (a: any, b: any) => match(a) && match(b),
    "|": (a: any, b: any) => match(a) || match(b),
  };
}

/**
 *
 * @param {Object} record
 * @param {DomainListRepr} domain
 * @returns {boolean}
 */
function matchDomain(record: Record<string, any>, domain: DomainListRepr) {
  if (domain.length === 0) {
    return true;
  }
  const operators = makeOperators(record);
  const reversedDomain = Array.from(domain).reverse();
  const condStack: any[] = [];
  for (const item of reversedDomain) {
    const operator =
      typeof item === "string" && operators[item as keyof typeof operators];
    if (operator) {
      const operands = condStack.splice(-operator.length);
      // @ts-ignore
      condStack.push(operator(...operands));
    } else {
      condStack.push(item);
    }
  }
  return matchCondition(record, condStack.pop());
}
