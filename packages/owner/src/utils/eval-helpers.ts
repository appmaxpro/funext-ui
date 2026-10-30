import { get, isPlainObject } from "lodash";
import { i18n } from "./i18n";
import { moment } from "./l10n";
import { toCamelCase, toKebabCase, toSnakeCase, toTitleCase } from "./names";
import { session } from "./session";

import format from "~/utils/format";

import type React from "react";
import type { BlockRenderProps } from "./block-types";
import { EMPTY_IMAGE, EMPTY_OBJECT } from "./constant";
import type { DataContext, DataRecord, Property } from "./data-types";

const evalHelpers = {
  get user() {
    return session.info?.user?.login;
  },
  get group() {
    return session.info?.user?.group;
  },
  get userId() {
    return session.info?.user?.id;
  },
  t(key: string, ...args: any[]) {
    return i18n.t(key, ...args);
  },
  moment(date: any) {
    return moment(date);
  },
  number(value: any) {
    return +value;
  },

  contains(iter: any, item: any) {
    return iter?.includes?.(item) ?? false;
  },
  sum(items: DataRecord[], field: string, operation?: string, field2?: string) {
    let total = 0;
    if (items && items.length) {
      items.forEach(function (item) {
        let value = 0;
        let value2 = 0;
        if (field in item) {
          value = +(item[field] || 0);
        }
        if (operation && field2 && field2 in item) {
          value2 = +(item[field2] || 0);
          switch (operation) {
            case "*":
              value = value * value2;
              break;
            case "/":
              value = value2 ? value / value2 : value;
              break;
            case "+":
              value = value + value2;
              break;
            case "-":
              value = value - value2;
              break;
          }
        }
        if (value) {
          total += value;
        }
      });
    }
    return total;
  },
  lower(value: any) {
    return typeof value === "string" ? value.toLowerCase() : value;
  },
  upper(value: any) {
    return typeof value === "string" ? value.toUpperCase() : value;
  },
  titleCase(value: any) {
    return typeof value === "string" ? toTitleCase(value) : value;
  },
  snakeCase(value: any) {
    return typeof value === "string" ? toSnakeCase(value) : value;
  },
  kebabCase(value: any) {
    return typeof value === "string" ? toKebabCase(value) : value;
  },
  camelCase(value: any) {
    return typeof value === "string" ? toCamelCase(value) : value;
  },
};

type Ref<X> = {
  readonly current: X;
};

function isRef(value: object): value is Ref<DataContext> {
  return "current" in value;
}

type EvalOptions = {
  valid?: (name?: string) => boolean;
  execute?: (name: string, options?: any /*ActionOptions*/) => Promise<any>;
  readonly?: boolean;
  required?: boolean;
  popup?: boolean;
  field?: (name: string) => Property | undefined;
  record?: DataRecord;
  helpers?: Record<string, any>;
  log?: boolean;
};

export function createEvalHelpers(
  context: Ref<DataContext> | DataContext,
  options?: EvalOptions,
) {

  const {
    execute = () => Promise.resolve(),
    valid = () => true,
    helpers: moreHelpers = {},
  } = (options ?? {}) as any;
  class EvalHelper {
    _field(name: string) {
      return options?.field?.(name);
    }
    get _readonly() {
      return options?.readonly === true;
    }

    get _required() {
      return options?.required === true;
    }
    get _popup() {
      return options?.popup === true;
    }
    get _record(): DataRecord {
      return options?.record ?? this._ctx._record ?? this._ctx;
    }
    get _ctx(): DataContext {
      return isRef(context) ? context.current : (context as DataContext);
    }
    get _exec() {
      return options?.execute ?? execute;
    }
    _extends(...sources: any[]) {
      return Object.assign({}, options, ...sources);
    }
    _get(path: string) {
      const value = get(this._record, path);
      return value;
    }

    _valid(name?: string) {
      return valid(name);
    }
    _invalid(name?: string) {
      return !valid(name);
    }

    _fmt(name: string, props?: any) {
      const value = this._get(name);
      return format(value, {
        context: this._record,
        props: props
          ? {
              ...this._field(name),
              ...props,
            }
          : this._field(name),
      });
    }
    _format(value: any, name: string, props?: any) {
      return format(value, {
        context: this._record,
        props: props
          ? {
              ...this._field(name),
              ...props,
            }
          : this._field(name),
      });
    }
    _media(fieldName: string, params: string) {
      let record = this._record;
      let model = this._ctx._model;
      const data = { model } as any;
      if (fieldName) {
        const field = this._field(fieldName);
        if (field) {
          if (field.target) {
            record = this._get(fieldName) || EMPTY_OBJECT;
            model = field.target;
            data.model = model;
          } else {
            const value = this._get(fieldName);
            if (field.pType === "string" || typeof value === "string") {
              return value || EMPTY_IMAGE;
            }
          }
        } else {
          data.field = fieldName;
        }
      }

      const id = record.id || 0;
      const version = record.version || record.$version || 0;
      data.id = String(id);
      const search = new URLSearchParams(data);

      return id
        ? `rest/media?${search}${params ? `&${params}` : ""}`
        : EMPTY_IMAGE;
    }
    _execute(action: string, actionContext?: DataContext) {
      const ctx = isPlainObject(actionContext) ? actionContext : null;
      const { _exact, ...otherCtx } = ctx ?? EMPTY_OBJECT;
      return this._exec(action, {
        context: ctx ? { ...(!_exact && this._ctx), ...otherCtx } : this._ctx,
        exact: !!_exact,
      });
    }
    _action(name: string) {
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        this._exec(name, {
          context: this._ctx,
        });
      };
    }
  }
  return new EvalHelper()
}

export default evalHelpers;
