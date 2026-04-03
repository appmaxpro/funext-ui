import { get, isPlainObject } from "lodash";

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
import { EMPTY_IMAGE, EMPTY_OBJECT } from "./constant";
import h from "./h";
import type { BlockRenderProps } from "./block-types";
import type React from "react";
import { evalCode } from "./eval";

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
const refSymbol = Symbol.for("$$ref");

type Ref<X> = {
  readonly current: X;
  readonly [refSymbol]: 1;
};

export function createRef(get: () => DataContext): Ref<DataContext> {
  const ref = Object.create({});
  Object.defineProperty(ref, "current", {
    get,
  });
  return ref;
}

function isRef(value: object): value is Ref<DataContext> {
  return "current" in value;
}

export function createEvalContext(
  context: Ref<DataContext> | DataContext,
  options?: EvalContextOptions,
) {
  const {
    execute = () => Promise.resolve(),
    valid = () => true,
    helpers: moreHelpers = {},
    components,
    log,
    //...others
  } = (options ?? {}) as any;

  const helpers = {
    _field(name: string) {
      return options?.field?.(name);
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
    get _record(): DataRecord {
      return (options?.record ?? helpers._ctx._record)
        ? helpers._ctx._record
        : helpers._ctx;
    },
    get _ctx(): DataContext {
      return isRef(context) ? context.current : (context as DataContext);
    },
    get _exec() {
      return options?.execute ?? execute;
    },
    _extends(...sources: any[]) {
      return Object.assign({}, helpers, ...sources);
    },
    _get(path: string) {
      const value = get(helpers._record, path);
      return value;
    },

    _valid(name?: string) {
      return valid(name);
    },
    _invalid(name?: string) {
      return !valid(name);
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
    _media(fieldName: string, params: string) {
      let record = helpers._record;
      let model = helpers._ctx._model;
      const data = {model} as any; 
      if (fieldName) {
        const field = helpers._field(fieldName);
        if (field) {
          if(field.target) {
            record = helpers._get(fieldName) || EMPTY_OBJECT;
            model = field.target;
            data.model = model;
          } else {
            const value = helpers._get(fieldName);
            if(field.pType === 'string' || typeof value === 'string' ) {
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
        ? `rest/media?${search.toString()}${params ? `&${params}` : ""}`
        : EMPTY_IMAGE;
    },
    _execute(action: string, actionContext?: DataContext) {
      const ctx = isPlainObject(actionContext) ? actionContext : null;
      const { _exact, ...otherCtx } = ctx ?? EMPTY_OBJECT;
      return helpers._exec(action, {
        context: ctx
          ? { ...(!_exact && helpers._ctx), ...otherCtx }
          : helpers._ctx,
        exact: !!_exact,
      });
    },
    _action(name: string) {
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        helpers._exec(name, {
          context: helpers._ctx,
        });
      };
    },
    _log: console.log,
    ...moreHelpers,
    ...components,
    //...others,
  };


  return createProxy(context, helpers, log);
}

function createProxy(
  ref: Ref<DataContext> | DataContext,
  helpers: Record<string, any>,
  log?: boolean,
) {
  type Context = DataContext & typeof helpers;

  let parentContext: unknown = undefined;
  const hasRef = isRef(ref);

  return new Proxy<Context>((hasRef ? ref.current : ref) as Context, {
    get(target, p, receiver) {
      if (log) {
        console.log("Proxy get:", p);
      }
      const ctx = hasRef ? ref.current : ref;
      if (p === "_parent") {
        return (
          Reflect.get(ctx, "_parent", receiver) ??
          Reflect.get(helpers, "_parent", receiver)
        );
      }

      const record = helpers._record;

      let value =
        Reflect.get(record, p, receiver) ??
        get(record, p) ??
        Reflect.get(ctx, p, receiver);

      if (value != null) {
        if (p === "id" && value && value === 0) {
          value = null;
        }
      } else if (typeof p === "string") {
        if (p === "_subContext") {
          return (sub: object) =>
            sub === target || sub === ref || sub === ctx || sub === receiver
              ? receiver
              : createSubEvalContext(receiver, sub);
        } else if (p in helpers) {
          if (log) console.log("Proxy get helper value:", p);
          return helpers[p as keyof typeof helpers];
        }
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
  const hasRef = isRef(sub);
  const ctx = hasRef ? sub.current : sub;

  let hasRec = "_record" in ctx;
  let set: (prop: string | symbol, value?: any) => any | undefined;

  if (hasRec && "_set" in ctx && typeof ctx._set === "function") {
    set = ctx._set as (prop: string | symbol, value?: any) => any;
  }

  return new Proxy<Context>(sub as Context, {
    get(target, p, receiver) {
      /*
      if (typeof p === "string" && p.startsWith("_") && Reflect.has(sub, p)) {
        return Reflect.get(sub, p, receiver);
      }
      */
      const ctx = hasRef ? (target as Ref<Context>).current : target;
      let value;
      try {
        if (hasRec) {
          value =
            Reflect.get((ctx as any)._record, p, receiver) ??
            get((ctx as any)._record, p);
        } else {
          value = Reflect.get(ctx, p, receiver) ?? get(target, p);
        }
      } catch (e) {}

      if (value === undefined) {
        if (p === "_subContext") {
          return (sub: object) =>
            sub === target || sub === ctx || sub === receiver || sub === context
              ? receiver
              : createSubEvalContext(receiver, sub);
        }
        value = Reflect.get(ctx, p, receiver);
      }
      return value;
    },
    set(target, p, value, receiver) {
      try {
        if (set) return set(p, value) ?? true;
        const ctx = hasRef ? (target as Ref<Context>).current : target;
        return Reflect.set(
          hasRec ? (ctx as any)._record : ctx,
          p,
          value,
          receiver,
        );
      } catch (e) {}
      return Reflect.set(context, p, value, receiver);
    },
  });
}

var cache = new LoadingCache<(ctx: DataContext) => any>();

export function evalExpr<T>(expr: string): (ctx: DataContext) => T {
  if (typeof expr === "function") {
    return expr;
  }
  return cache.get(expr, () => {
    try {
      console.log("Try evalExpr: ", expr);
      return evalCode(expr, "ctx") as (ctx: DataContext) => T;
    } catch (e) {
      console.error(e);
      (window as any)._expr = expr;
      throw e;
    } finally {
      console.log("Complete evalExpr: ");
    }
  });
}

var renderCache = new LoadingCache<(props: BlockRenderProps) => any>();

const globalRender = {
  isGlobal: (prop: string) => prop === "render",
};

export function evalRender(
  expr: string,
  scope?: Record<string, any>,
): React.FunctionComponent<BlockRenderProps> {
  if (typeof expr === "function") {
    return expr;
  }
  return renderCache.get(expr, () => {
    let P = scope ?? EMPTY_OBJECT;
    const c = new Proxy(P, {
      get: (target, prop, receiver) => {
        let value = Reflect.get(P, prop, receiver);
        if (value === undefined && "C" in P) {
          value = Reflect.get(P.C, prop, receiver);
        }
        return value;
      },
    });
    try {
      const fn = evalCode(expr, "h, ctx, props, c");
      return function (props: BlockRenderProps) {
        try {
          console.log("Try evalRender: ", expr);
          return fn(h, props.ctx, props.props, c);
        } finally {
          console.log("Complete evalRender: ");
        }
      };
    } catch (e) {
      console.error(e);
      (window as any)._expr = expr;
      throw e;
    }
  });
}

export function miniRender(expr: string) {
  if (typeof expr === "function") {
    return expr;
  }
  try {
    const fn = evalCode(expr, "h, ctx");
    return function (ctx: object) {
      try {
        console.log("Try miniRender: ", expr);
        return fn(h, ctx);
      } finally {
        console.log("Complete miniRender: ");
      }
    };
  } catch (e) {
    console.error(e);
    (window as any)._expr = expr;
    throw e;
  }
}

export function createScopeContext(ctx: any, parent: object) {
  return new Proxy(ctx, {
    get: (target, prop, receiver) => {
      let value = Reflect.get(target, prop, receiver);
      if (value === undefined && "C" in target) {
        value = Reflect.get(target.C, prop, receiver);
      }
      if (value === undefined) {
        value = Reflect.get(parent, prop, receiver);
      }
      return value;
    },
  });
}
