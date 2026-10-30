import { get, isPlainObject } from "lodash";

import { LoadingCache } from "~/utils/cache";
import format from "~/utils/format";

import type React from "react";
import type { BlockRenderProps } from "./block-types";
import { EMPTY_IMAGE, EMPTY_OBJECT } from "./constant";
import type { DataContext, DataRecord, Property } from "./data-types";
import { evalCode } from "./eval";
import h from "./h";
import app from "./app";
import { LinkedList } from "./linked-list";
import { createEvalHelpers } from "./eval-helpers";

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
    log,
    //...others
  } = (options ?? {}) as any;
    
  const helpers = createEvalHelpers(context, options);

  return createProxy(context, helpers, log);
}

function createProxy(
  ref: Ref<DataContext> | DataContext,
  helpers: Record<string, any>,
  log?: boolean,
) {
  type Context = DataContext & typeof helpers;

  //let parentContext: unknown = undefined;
  const hasRef = isRef(ref);
  const linked = new LinkedList<DataContext>();
  linked.append(hasRef ? ref.current : ref);

  const extend = (data: DataRecord) => {
    let current = { ...linked.head, ...data };
    linked.append(current);

    return () => {
      linked.delete(current);
    };
  };

  return new Proxy<Context>(linked.head as Context, {
    get(target, p, receiver) {
      if (log) {
        console.log("Proxy get:", p);
      }
      const ctx = linked.head!;
      if (p === "_parent") {
        return (
          Reflect.get(ctx, "_parent", receiver) ??
          Reflect.get(helpers, "_parent", receiver)
        );
      }

      const record = helpers._record;

      let value = record
        ? (Reflect.get(record, p, receiver) ??
          get(record, p) ??
          Reflect.get(ctx, p, receiver))
        : Reflect.get(ctx, p, receiver);

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
          value = helpers[p as keyof typeof helpers];
        } else if (p === "_app") {
          value = app;
        } else if (p === "_extends") {
          value = extend;
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

  const list = new LinkedList<DataContext>();
  list.append(ctx);

  const extend = (data: DataRecord) => {
    const current = { ...list.head, ...data };
    list.append(current);
    return () => {
      list.delete(current);
    };
  };

  let hasRec = !!(ctx as any)._record;
  let set: (prop: string | symbol, value?: any) => any | undefined;

  if (hasRec && "_set" in ctx && typeof ctx._set === "function") {
    set = ctx._set as (prop: string | symbol, value?: any) => any;
  }

  return new Proxy<Context>(ctx as Context, {
    get(target, p, receiver) {
      /*
      if (typeof p === "string" && p.startsWith("_") && Reflect.has(sub, p)) {
        return Reflect.get(sub, p, receiver);
      }
      */
      const ctx = list.head!;
      let value;
      try {
        if (hasRec) {
          const record = (ctx as any)._record;
          value = Reflect.get(record, p, receiver) ?? get(record, p);
        }

        if (value === undefined) {
          value = Reflect.get(ctx, p, receiver) ?? get(ctx, p);
        }
      } catch (e) {}

      if (value === undefined) {
        if (p === "_subContext") {
          return (sub: object) =>
            sub === target || sub === ctx || sub === receiver || sub === context
              ? receiver
              : createSubEvalContext(receiver, sub);
        } else if (p === "_extends") {
          value = extend;
        } else {
          value = Reflect.get(context, p, receiver);
        }
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
