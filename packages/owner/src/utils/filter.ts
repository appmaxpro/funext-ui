import { extend, isArray, isEmpty } from "lodash";
import lodashGet from "lodash/get";
import { getDateDomain } from "~/utils/date";
import {
  type Field,
  type Option,
  type DomainsGet,
  type Container,
  type PropertyType,
  type Widget,
  type Domains,
  isContainer,
} from "./data-types";
import { EMPTY_ARRAY } from "./constant";
const FilterContainerTypes = ["list", "col", "row"];
const LOGICAL = ["&", "|"];

export type OP = "&" | "|";

export declare type DomainGet = DomainsGet;

export interface FilterOption extends Option {
  domain?: any[] | DomainGet;
}

export interface Constraint {
  min: string | number;
  max: string | number;
}

export type WidgetType =
  | "text"
  | "number"
  | "m2o"
  | "select"
  | "tabs"
  | "node"
  | "test"
  | "custom";

export type ContainerWidgetType = "panel" | "list" | "group";

export type Comparison =
  | "="
  | ">"
  | "<"
  | ">="
  | "<="
  | "!="
  | "in"
  | "not in"
  | "like"
  | "not like"
  | "between"
  | "null"
  | "not null";

const containerTypes = ["panel", "list", "group"];

export type FilterWidget = Widget & {
  widget?: WidgetType | ContainerWidgetType;
  //op?: OP;
};

export interface FilterFormField extends Field {
  value?: string | number | boolean | Date | object | Array<any>;
}

export interface FilterField
  extends Omit<Field, "widget">,
    Omit<FilterWidget, "type" | "name"> {
  field?: string;
  pType: PropertyType;
  value?: string | number | boolean | Date | object | Array<any>;
  comp?: Comparison;
}

export interface FilterFieldSelect extends FilterField {
  op?: OP;
}

export interface FilterFieldOptions extends FilterFieldSelect {
  widget: "select";
  options: Array<Option>;
  optionsName?: string;
}

export interface FilterFieldDateOptions
  extends Omit<FilterFieldSelect, "options"> {
  widget: "select";
  options: Array<string>;
  optionsName?: string;
}

export interface FilterFieldRelation extends Omit<FilterFieldSelect, "domain"> {
  widget: "m2o";
  domain?: Field["domain"];
}

export interface NodeSearchFilterField extends FilterFieldSelect {
  widget: "node";
  parent: string;
  rootDomain: string;
}

export interface FilterFieldCustom extends FilterField {
  widget: "custom";
}

export interface FilterContainer extends Container<FilterWidget> {
  widget: ContainerWidgetType;
  op?: OP;
}

export interface TestFilter extends Omit<FilterWidget, "name" | "title">, Option {
  widget: "test";
  domain?: DomainGet;
}

export interface ValueFilter extends Omit<TestFilter, "checked" | "value"> {
  value: any;
}


export interface FilterGroup extends Container<TestFilter> {
  widget: "group";
  multiple?: boolean;
  name: string;
}

export interface FilterTabs extends FilterField {
  widget: "tabs";
  multiple: false;
  options: Array<Option>;
}

export interface FilterList extends FilterContainer {
  widget: "list";
}

export interface SidebarFilter extends Omit<Widget, "items"> {
  items: Array<FilterGroup | FilterField>;
  openState: Record<string, boolean>;
}

export type Filter = FilterContainer | FilterWidget;

/*
export function isContainer(widget: FilterWidget): widget is FilterContainer {
  return containerTypes.includes(widget.type) || 'items' in widget;
}*/

export const isSelect = (widget: FilterWidget): widget is FilterFieldSelect =>
  widget.widget === "m2o" || widget.widget === "select" || 'options' in widget;

export function isField(widget: FilterWidget): widget is FilterField {
  return widget.type === "field" || isSelect(widget);
}

function addToDomainArray(domain: any[], newDomain: any[]) {
  if (Array.isArray(newDomain) && newDomain.length) {
    let [first, ...rest] = newDomain;
    if (Array.isArray(first)) {
      domain.push(...newDomain);
    } 
    else if(first === '&' || first === '|' ) {
       if (Array.isArray(rest[0])) {
         domain.push(first);
         domain.push(...rest);
       } else {
         domain.push(rest);
       }
    }
    else {
      domain.push(newDomain);
    }
  }
}

// @ts-expect-error TS(7006): Parameter 'dt' implicitly has an 'any' type.
export function toIsoDate(dt, type = "date") {
  let d = dt instanceof Date ? dt.toISOString() : new Date(dt).toISOString();
  if (type === "date") {
    d = d.substring(0, 10);
  } else {
    d = d.substring(0, 19);
  }
  return d;
}

export const buildDomain = (
  filter: Filter,
  values: any,
  ctx?: any,
): Domains[] | null => {
  return build(filter, values, ctx);
};

const build = (
  filter: Filter,
  values: any,
  ctx?: any,
  parent?: Filter,
): Domains[] | null => {
  const result: any[] = [];
  if (isContainer(filter)) {
    const childResult: any[] = [],
      children = filter.items || [];
    for (let filterChild of children) {
      const filterChildValue = build(filterChild, values, ctx, filter);
      if (filterChildValue && filterChildValue.length) {
        addToDomainArray(childResult, filterChildValue);
      }
    }
    if (childResult.length > 0) {
      if (filter.op && childResult.length > 1) {
        result.push(filter.op);
      }
      result.push(...childResult);
    }
  } else if (isField(filter)) {
    let value = ctx && filter.name ? ctx[filter.name] : (filter.value as any);
    const name = filter.name;
    const field = filter.field || filter.name;
    let comp = filter.comp || (filter.pType === "string" ? "like" : "=");
    const domain = filter.domain;

    if (
      isSelect(filter) &&
      (value === null ||
        value === "" ||
        (filter.multiple && (!Array.isArray(value) || !value.length)))
    ) {
      if (comp === "null" || comp === "not null") {
        result.push([field, comp === "null" ? "=" : "!=", false]);
        values[filter.name!] = null;
      }
    } else {
      function getFilterDomain(fallback: () => any) {
        if (domain) {
          addToDomainArray(
            result,
            typeof domain === "function" ? domain(ctx ?? values) : domain,
          );
          return null;
        }
        const filterValue = fallback();
        values[name] = filterValue;
        return filterValue;
      }

      switch (filter.pType) {
        case "int":
          value = getFilterDomain(() => parseInt(value));
          break;
        case "float":
          value = getFilterDomain(() => parseFloat(value));
          break;
        case "boolean":
          value = getFilterDomain(() => !!value);
          break;
        case "date":
        case "datetime":
          if (Array.isArray(value)) {
            if (value.length == 2 && value[0] && value[1]) {
              values[filter.name!] = [value[0], value[1]];
              result.push([field, ">=", toIsoDate(value[0], filter.type)]);
              result.push([field, "<=", toIsoDate(value[1], filter.type)]);
              value = null;
            } else if (value[0]) {
              result.push([field, "=", toIsoDate(value[0], filter.type)]);
            }
          } else {
            values[filter.name!] = value;
            value = getFilterDomain(() => value);
            if (value) {
              const dateDomain = getDateDomain(value, field!, filter.pType);
              if (dateDomain) {
                addToDomainArray(result, dateDomain);
              } else {
                delete values[filter.name!];
              }
              value = null;
            }
          }
          break;
        default: {
          if (isSelect(filter) && filter.options) {
            
            const optionMap: any = {};
            let optFilter = filter as FilterFieldOptions;

            for (let option of optFilter.options!) {
              optionMap[option.value!] = option;
            }
            if (optFilter.multiple) {
              comp = filter.comp ?? 'in';
              let op = optFilter.op ?? '|'
              if (Array.isArray(value)) {
                const domainOptions = [];
                const inOptions = [];
                for (let val of value) {
                  const option = optionMap[val];
                  if (option && option.domain) {
                    const domain =
                      typeof option.domain === "function"
                        ? option.domain(ctx || values)
                        : option.domain;
                    //addToDomainArray(domainOptions, domain);
                    domainOptions.push(domain);
                  } else {
                    if (comp === "in" || comp === "not in") {
                      inOptions.push(val);
                    } else {
                      domainOptions.push([field, comp, val]);
                    }
                  }
                }
                const selectLength =
                  domainOptions.length + (inOptions.length ? 1 : 0);
                if ( op ) {
                  for (let i = 0; i < selectLength - 1; i++)
                    result.push(optFilter.op);
                }

                if (domainOptions.length) result.push(...domainOptions);

                if (inOptions.length) {
                  result.push([field, comp, inOptions]);
                }

                values[filter.name!] = value;
                value = null;
              }
            } else {
              const option = optionMap[value];

              if (option?.domain) {
                const domain =
                  typeof option.domain === "function"
                    ? option.domain(ctx || values)
                    : option.domain;
                addToDomainArray(result, domain);
                value = null;
                values[filter.name!] = true;
              }
            }
          }
          break;
        }
      }

      if (value != null && value !== Infinity) {
        values[filter.name!] = value;
        if (Array.isArray(value)) {
          if (
            value.length &&
            filter.multiple
          ) {
            comp = filter.comp ?? 'in';
            if (value.length === 1) {
              result.push([field, comp === "in" ? "=" : "!=", value]);
            } else {
              result.push([field, comp, value]);
            }
          }
        } else if (["in", "not in"].includes(comp)) {
          if (filter.widget === "select") {
            result.push([field, comp === "in" ? "=" : "!=", value]);
          }
        } else {
          result.push([field, comp, value]);
        }
      }
    }
  } else {
    console.warn(
      "Filter:: unknown filter entry: ",
      filter,
      parent ? " in parent:" : "",
      parent ? parent : "",
    );
  }

  return result.length ? result : null;
};

export const setValues = (filter: Filter, values: any): any => {
  if (isContainer(filter)) {
    for (let filterChild of filter.items) {
      setValues(filterChild as Filter, values);
    }
  } else if (filter.name) {
    let value = lodashGet(values, filter.name);
    if (value != null) {
      if (isSelect(filter) && filter.multiple) {
        if (!Array.isArray(value)) {
          value = [value];
        }
      }
    }
    (filter as any).value = value;
  }
};

const getResultValues = (
  filter: FilterWidget,
  values: any,
  result: any = {},
): any => {
  if (isContainer(filter)) {
    for (let filterChild of filter.items) {
      getResultValues(filterChild as FilterWidget, values, result);
    }
  } else if ((filter as FilterField).name) {
    let filterField = filter as FilterField;
    let value = lodashGet(values, filterField.name);
    if (value != null && value != "") {
      if (isSelect(filterField) && filterField.multiple) {
        if (!Array.isArray(value)) {
          value = [value];
        }
      }

      result[filterField.name!] = value;
    }
  }
  return result;
};

export const getValues = (filters: Filter | Filter[], values?: any): any => {
  filters = Array.isArray(filters) ? filters : [filters];
  let result = {};
  for (let filter of filters) getResultValues(filter, values, result);

  return result;
};

export const getDefaults = (
  filters: FilterWidget | FilterWidget[],
  result?: object,
): any => {
  result = result || {};
  filters = Array.isArray(filters) ? filters : [filters];
  for (let filter of filters) _getDefaults(filter, result);

  return Object.keys(result).length ? result : null;
};

export const _getDefaults = (filter: FilterWidget, result: any): any => {
  if (isContainer(filter)) {
    for (let filterChild of filter.items) {
      getDefaults(filterChild as FilterWidget, result);
    }
  } else if (isField(filter)) {
    let value = filter.value as any;
    if (value != null && value != "") {
      if (isSelect(filter) && filter.multiple) {
        if (!Array.isArray(value)) {
          value = [value];
        }
      }
      result[filter.name] = value;
    }
  }

  return result;
};

export const hasAtLeaseOneDomain = (obj: any) => {
  return Array.isArray(obj) && obj.some((a) => isValidDomain(a));
};

export const isValidDomain = (obj: any) => {
  return (
    Array.isArray(obj) &&
    (Array.isArray(obj[0]) || obj[0] === "&" || obj[0] === "|")
  );
};

export const _convertDomainToFilter = (domain: any[], result: any[]) => {
  //domain = domain.reverse();
  for (let el of domain) {
    if (isValidDomain(el)) {
      const addClose =
        result.length > 0 && LOGICAL.includes(result[result.length - 1]);
      if (addClose) {
        result.push("(");
      }
      _convertDomainToFilter(el, result);
      if (addClose) {
        result.push(")");
      }
    } else {
      if (LOGICAL.includes(el)) {
        result.push(` ${el} `);
        continue;
      } else if (
        result.length &&
        !LOGICAL.includes(result[result.length - 1])
      ) {
        result.push("& ");
      }
      const [field, comp, value] = el;
      const jsonValue = JSON.stringify(value).replace(/\"/g, "'");
      result.push(`${field} ${comp.replace(/like/g, "%")} ${jsonValue} `);
    }
  }
};

export const convertDomainToFilter = (domain: any[]): string | null => {
  if (!Array.isArray(domain) || !domain.length) return null;
  const result: any[] = [];
  _convertDomainToFilter(domain, result);
  return result.length ? result.join("").trim() : null;
};

export const getValidDomain = (domain: any[], values: any) => {
  if (!domain) return null;
  if (Array.isArray(domain)) {
    domain = JSON.parse(JSON.stringify(domain));
    _getValidDomain(domain, values);
    return domain;
  }
};

const _getValidDomain = (domain: any[], values: any) => {
  if (Array.isArray(domain)) {
    if (domain.length === 3 && !isValidDomain(domain[0])) {
      const [_, __, value] = domain;
      if (typeof value === "string" && value.startsWith(":")) {
        domain[2] = lodashGet(values, value.substring(1));
      }
    } else {
      for (let el of domain) {
        _getValidDomain(el, values);
      }
    }
  }
};

export const normalizeDomain = (array: any[] | any) => {
  const result: any[] = [];
  const visit = (arr: any[] | any) => {
    let handled = true;
    if (Array.isArray(arr)) {
      for (let dd of arr) {
        if (LOGICAL.includes(dd)) {
          result.push(dd);
          handled = true;
        } else if (Array.isArray(dd)) {
          if (dd.length === 3 && typeof dd[0] === "string") {
            result.push(dd);
          } else {
            visit(dd);
          }
          handled = true;
        }
      }
    } else {
      result.push(arr);
      handled = true;
    }
  };

  visit(array);
  return result.length ? result : null;
};
