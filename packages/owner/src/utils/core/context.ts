import { evaluate, parse } from "../parser";
import { AstType, type AstNode, type ObjectLiteral } from "../parser/ast";
import { DEFAULT_NATIVES } from "../parser/natives";

/**
 * @typedef {{
 *  lang?: string;
 *  tz?: string;
 *  uid?: number | false;
 *  [key: string]: any;
 * }} Context
 * @typedef {Context | string | undefined} ContextDescription
 */

/**
 * Create an evaluated context from an arbitrary list of context representations.
 * The evaluated context in construction is used along the way to evaluate further parts.
 *
 * @param {ContextDescription[]} contexts
 * @param {Context} [initialBindings] optional evaluation context to start from.
 * @returns {Context}
 */
export function makeContext(contexts:any[], initialBindings:any) {
    const evaluationContext = Object.assign({}, initialBindings);
    const context = {};
    for (let ctx of contexts) {
        if (ctx !== "") {
            ctx = typeof ctx === "string" ? evaluate(ctx, evaluationContext) : ctx;
            Object.assign(context, ctx);
            Object.assign(evaluationContext, context); // is this behavior really wanted ?
        }
    }
    return context;
}

/**
 * Extract a partial list of variable names found in the AST.
 * Note that it is not complete. It is used as an heuristic to avoid
 * evaluating expressions that we know for sure will fail.
 *
 * @param {AST} ast
 * @returns string[]
 */
function getPartialNames(ast: AstNode): string[] {
    if (ast.type === AstType.Identifier) { //5
        return [ast.name];
    }
    if (ast.type === AstType.UnaryExpr /*6*/) {
        return getPartialNames(ast.right);
    }
    /* type = 14 | 7*/
    if (ast.type === AstType.BinaryExpr) {
        return getPartialNames(ast.left).concat(getPartialNames(ast.right));
    }
    //15
    if (ast.type === AstType.MemberExpr) {
        return getPartialNames(ast.object);
    }
    return [];
}

/**
 * Allow to evaluate a context with an incomplete evaluation context. The evaluated context only
 * contains keys whose values are static or can be evaluated with the given evaluation context.
 *
 * @param {string} expr
 * @param {Context} [bindings={}]
 * @returns {Context}
 */
export function evalPartialContext(expr:string, bindings:any = {}) {
    const ast = parse(expr) as ObjectLiteral;
    const context:any = {};
    for (const key in ast.properties) {
        const value = ast.properties[key].value;
        if (
            getPartialNames(value).some((name:string) => !(name in bindings || name in DEFAULT_NATIVES))
        ) {
            continue;
        }
        try {
            context[key] = evaluate(value, bindings);
        } catch {
            // ignore this key as we can't evaluate its value
        }
    }
    return context;
}
