import { get, isEmpty, isPlainObject } from "lodash";

import { i18n } from "~/utils/i18n";
import { moment } from "~/utils/l10n";
import { session } from "~/utils/session";
import format from "~/utils/format";
import {
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toTitleCase,
} from "~/utils/names";
import { LoadingCache } from "~/utils/cache";

import type { DataContext, DataRecord, Property } from "./data-types";
import { compileExpr } from "./expressions";
import { EMPTY_OBJECT, EMPTY_RECORD } from "./constant";
import h, { blockSet } from "./h";
import type { BlockRenderProps } from ".";
import type React from "react";

export type EvalContextOptions = {
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

export function createEvalContext(
  context: DataContext,
  options?: EvalContextOptions,
) {
  const {
    execute = () => Promise.resolve(),
    valid = () => true,
    helpers: moreHelpers = {},
    components,
    log,
    ...others
  } = (options ?? {}) as any;

  //const noFields = !!options?.field;

  const globalHelpers = {};

  const helpers = {
    _field(name: string) {
      return options?.field?.(name);
    },
    get _user() {
      return session.info?.user?.login;
    },
    get _group() {
      return session.info?.user?.group;
    },
    get _userId() {
      return session.info?.user?.id;
    },
    get _readonly() {
      return options?.readonly === true;
    },
    get _required() {
      return options?.required === true;
    },
    get _popup() {
      return options?.popup === true;
    },
    get _record() {
      return (options?.record ?? context._record) ? context._record : context;
    },
    _extends(...sources: any[]) {
      return Object.assign({}, helpers, ...sources);
    },
    _t(key: string, ...args: any[]) {
      return i18n.t(key, ...args);
    },
    _get(path: string) {
      const value = get(helpers._record, path);
      if (value === undefined) {
        const dotIndex = path.indexOf(".");
        const key = path.substring(0, dotIndex);
        if (isJsonField(key)) {
          const subPath = path.substring(dotIndex + 1);
          const jsonText = context[key];
          const json = tryJson(jsonText);
          if (json) {
            return get(json, subPath);
          }
        }
      }
      return value;
    },
    _moment(date: any) {
      return moment(date);
    },
    _number(value: any) {
      return +value;
    },

    _contains(iter: any, item: any) {
      return iter?.includes?.(item) ?? false;
    },
    _json(name: string) {
      const value = helpers._get(name);
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return {};
        }
      }
    },
    _valid(name?: string) {
      return valid(name);
    },
    _invalid(name?: string) {
      return !valid(name);
    },
    _sum(
      items: DataRecord[],
      field: string,
      operation?: string,
      field2?: string,
    ) {
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
    _fmt(name: string, props?: any) {
      const value = helpers._get(name);
      return format(value, {
        context: helpers._record,
        props: props
          ? {
              ...helpers._field(name),
              ...props,
            }
          : helpers._field(name),
      });
    },
    _format(value: any, name: string, props?: any) {
      return format(value, {
        context: helpers._record,
        props: props
          ? {
              ...helpers._field(name),
              ...props,
            }
          : helpers._field(name),
      });
    },
    _lower(value: any) {
      return typeof value === "string" ? value.toLowerCase() : value;
    },
    _upper(value: any) {
      return typeof value === "string" ? value.toUpperCase() : value;
    },
    _titleCase(value: any) {
      return typeof value === "string" ? toTitleCase(value) : value;
    },
    _snakeCase(value: any) {
      return typeof value === "string" ? toSnakeCase(value) : value;
    },
    _kebabCase(value: any) {
      return typeof value === "string" ? toKebabCase(value) : value;
    },
    _camelCase(value: any) {
      return typeof value === "string" ? toCamelCase(value) : value;
    },
    _image(fieldName: string, imageName: string) {
      let record = helpers._record;
      let model = context._model;

      if (fieldName) {
        const field = options?.field?.(fieldName);
        if (field && field.target) {
          record = helpers._get(fieldName) || EMPTY_RECORD;
          model = field.target;
        }
      }

      const id = record.id || 0;
      const version = record.version || record.$version || 0;

      return id
        ? `ws/rest/${model}/${id}/${imageName}/download?image=true&v=${version}&parentId=${id}&parentModel=${model}`
        : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    },
    _execute(action: string, actionContext?: DataContext) {
      const ctx = isPlainObject(actionContext) ? actionContext : null;
      const { _exact, ...otherCtx } = ctx ?? EMPTY_RECORD;

      return execute(action, {
        context: ctx
          ? { ...(!_exact && context), ...otherCtx }
          : { ...context },
        exact: !!_exact,
      });
    },
    _action(name: string) {
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        execute(name, {
          context,
        });
      };
    },
    _log: console.log,
    ...moreHelpers,
    ...globalHelpers,
    ...components,
    ...others,
  };

  function isJsonField(name: string) {
    return !options?.field || ((options?.field?.(name) as any)?.json ?? false);
  }

  function isJsonValue(value: unknown): value is string {
    if (typeof value === "string") {
      const text = value.trim();
      return text.startsWith("{") && text.endsWith("}");
    }
    return false;
  }

  function tryJson(value: unknown) {
    if (isJsonValue(value)) {
      try {
        return JSON.parse(value);
      } catch (e) {
        // Ignore
      }
    }
  }

  return createProxy(context, helpers, isJsonField, tryJson, log);
}

function createProxy(
  context: DataContext,
  helpers: Record<string, any>,
  isJsonField: (name: string) => boolean,
  tryJson: (value: unknown) => any,
  log?: boolean,
) {
  type Context = DataContext & typeof helpers;

  let parentContext: unknown = undefined;

  return new Proxy<Context>(context as Context, {
    get(target, p, receiver) {
      if (log) {
        console.log("Proxy get:", p);
      }

      if (
        p === "_parent" &&
        (parentContext ||
          Reflect.has(target, "_parent") ||
          receiver._getParent ||
          helpers._getParent)
      ) {
        return (
          parentContext ??
          (parentContext = Reflect.has(target, "_parent")
            ? Reflect.get(target, "_parent")
            : (receiver._getParent || helpers._getParent)())
        );
      }

      const record = target._record ? target._record : target;

      let value = Reflect.get(record, p, receiver) ?? get(record, p);
      if (p === "id" && value && value === 0) {
        return null;
      }

      if (value === undefined && typeof p === "string") {
        if (p.startsWith("$")) {
          const key = p.substring(1);
          if (isJsonField(key)) {
            const jsonText = target[key];
            const json = tryJson(jsonText);
            if (json) {
              value = json;
            }
          }
        } else if (p === "_subContext") {
          return (sub: object) =>
            sub === target || sub === receiver
              ? receiver
              : createSubEvalContext(receiver, sub);
        }
      }

      if (p in helpers) {
        if (log) console.log("Proxy get helper value:", p);
        return helpers[p as keyof typeof helpers];
      }

      if (p === "_this") {
        return receiver;
      }

      if (p === "_ctx") {
        return context;
      }

      if (log) {
        console.log("Proxy get value:", p, "=", value);
      }
      return value;
    },
    set(target, p, value, receiver) {
      if (log) {
        console.log("Proxy set:", p, "=", value);
      }
      if (helpers._set) {
        helpers._set(p, value);
        return true;
      }
      throw new Error("Cannot update context");
    },
  });
}

export function createSubEvalContext<Context extends object>(
  context: Context,
  sub: object,
) {
  let record = sub;
  let hasRec = "_record" in sub;
  let set: (prop: string | symbol, value?: any) => any | undefined;

  if (hasRec && "_set" in sub && typeof sub._set === "function") {
    set = sub._set as (prop: string | symbol, value?: any) => any;
  }

  return new Proxy<Context>(sub as Context, {
    get(target, p, receiver) {
      /*
      if (typeof p === "string" && p.startsWith("_") && Reflect.has(sub, p)) {
        return Reflect.get(sub, p, receiver);
      }
      */
      let value;
      try {
        if (hasRec) {
          value =
            Reflect.get((target as any)._record, p, receiver) ??
            get((target as any)._record, p);
        } else {
          value = Reflect.get(target, p, receiver) ?? get(target, p);
        }
      } catch (e) {}

      if (value === undefined) {
        if (p === "_subContext") {
          return (sub: object) =>
            sub === target || sub === receiver || sub === context
              ? receiver
              : createSubEvalContext(receiver, sub);
        }
        value = Reflect.get(target, p, receiver);
      }
      return value;
    },
    set(target, p, value, receiver) {
      try {
        
        if (set) return set(p, value) ?? true;
        
        return Reflect.set(hasRec ? (target as any)._record : target, p, value, receiver);
      } catch (e) {}
      return Reflect.set(context, p, value, receiver);
    },
  });
}

var cache = new LoadingCache<(ctx: DataContext) => any>();

export function evalExpr<T>(expr: string): (ctx: DataContext) => T {
  return cache.get(expr, () => {
    return new Function("ctx", expr) as (ctx: DataContext) => T;
  });
}

var renderCache = new LoadingCache<(props: BlockRenderProps) => any>();

const globalRender = {
  isGlobal: (prop: string) => prop === "render",
};

export function evalRender(
  expr: string,
): React.FunctionComponent<BlockRenderProps> {
  return renderCache.get(expr, () => {
    const fn = new Function("h", "ctx", "c", expr);
    let P = EMPTY_OBJECT;
    const c = new Proxy(P, {
      get: (target, prop, receiver) => {
        let value = Reflect.get(target, prop, receiver);
        if (value === undefined && "C" in target) {
          value = Reflect.get(target.C, prop, receiver);
        }
        return value;
      },
    });
    return function (props: BlockRenderProps) {
      P = props;
      //blockSet.set(props)
      try {
        return fn(h, props.ctx, c);
      } finally {
        //blockSet.restore()
      }
    };
  });
}
