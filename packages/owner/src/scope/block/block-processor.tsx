import { isNumber } from "lodash";
import React from "react";
import {
  EMPTY_ARRAY,
  EMPTY_RECORD,
  isField,
  isPlainObject,
  processWidget,
  toTitleCase,
  isDevelopment,
  type Block,
  type BlockHandler,
  type Container,
  type FilterView,
  type FormView,
  type RelationField,
  type ResourceView,
  type Schema,
  type Widget,
  type DynamicField,
} from "~/utils";
import {
  EvalFlags,
  type Props,
  type RenderParams,
  type SchemaBlock,
  type SxProps,
  type ViewBlock,
} from "~/utils/block-types";
import {
  createScopeContext,
  evalExpr,
  evalRender,
  miniRender,
} from "~/utils/eval-context";

function dotToCamelCase(name: string) {
  if (name && name.indexOf(".") > -1) {
    return name.split(".").map(toTitleCase).join(".");
  }
  return toTitleCase(name);
}

const handlers = new Map<string, BlockHandler<any>>();
type RenderOptions<S extends Block = any> = {
  //block: S;
  params: RenderParams<S>;
  props: () => SxProps;
  ref?: any;
};
export class BaseBlockHandler<S extends Block = any>
  implements BlockHandler<S>
{
  id = "";
  scope = "";
  init(block: any, s: Schema) {}
  render(block: S, options: RenderOptions<S>) {
    return null;
  }

  canRender(block: Partial<S>, s: Schema) {
    return false;
  }
}

export function registerBlockHandlers<S extends Block = any>(
  id: string,
  handler:
    | BlockHandler<S>
    | ((get: (id: string) => BlockHandler<any> | undefined) => BlockHandler<S>),
) {
  const handle =
    typeof handler === "function"
      ? handler(handlers.get.bind(handlers))
      : handler;

  if (handle.constructor !== Object) {
    handlers.set(id, handle);
    return;
  }

  function HandlerFn() {}
  const handlerProto = (HandlerFn.prototype = new BaseBlockHandler<S>());

  Object.assign(handlerProto, handle);

  handlers.set(id, handlerProto);
}

export const nullResourceView: ResourceView = {
  type: "custom",
  items: EMPTY_ARRAY as any,
  name: "null",
  uid: "0",
} as const;

const viewCache = new WeakMap<ResourceView, ViewBlock>();

export function processViewBlock<R extends ResourceView>(res: R, ctx: any) {
  const found = viewCache.get(res);
  if (found) return found;
  const block = processView(res, ctx);
  if (!isDevelopment) viewCache.set(res, block as ViewBlock);

  return block as ViewBlock<R>;
}

type BlockScope = {
  root?: ResourceView;
  scope: string;
  ctx: any;
  handler?: BlockHandler;
  parent?: BlockScope;
};

function toItem(items: Block[]) {
  if (items.length === 1) return items[0];
  return items;
}

function toArray(items: any) {
  return items
    ? Array.isArray(items)
      ? items
      : [items]
    : (EMPTY_ARRAY as Widget[]);
}

function processView(
  res: ResourceView,
  ctx: any,
  handler?: BlockHandler,
): SchemaBlock {
  let others: any;
  handler ??= handlers.get(res.handler ?? res.type)!;

  let newCtx = handler?.scopeContext ? (handler.scopeContext(ctx) ?? ctx) : ctx;

  if (newCtx !== ctx) {
    ctx = createScopeContext(newCtx, ctx);
  }

  const scope = {
    root: res,
    scope: res.type,
    ctx,
    handler,
  };

  const result = handleSchema(res, scope);
  if (result) {
    return result;
  }

  if (res.type === "form") {
    others = processForm({}, res as FormView);
  } else if (res.type === "filter-form") {
    others = processFilterForm({}, res as FormView);
  } else if (res.type === "filter" && (res as FilterView).form) {
    const { form } = res as FilterView;
    others = {
      form: {
        ...processView(form!, ctx),
        readonly: false,
        edit: true,
        create: true,
      },
    };
  }

  const viewBlock = {
    ...others,
    type: res.type,
    sType: res.type,
    items: toArray(res.items)
      .map((item) => mapWidget(item, scope, 1))
      .filter(Boolean),
    schema: res,
    level: 0,
    uid: res.uid,
  };

  handler?.init?.(viewBlock, res);

  return processProps(viewBlock, res, ctx);
}

function handleSchema(res: Schema, scope: BlockScope) {
  if (!res.uid) res = processWidget(res, scope.ctx);

  return scope.handler?.map?.(res, scope);
}

export function getHandlerRender<B extends { handler?: string }>(block: B) {
  return block.handler ? handlers.get(block.handler) : undefined;
}

function mapWidget(
  res: Widget,
  scope: BlockScope,
  level: number,
): SchemaBlock | undefined {
  if (!canEval(res, scope)) {
    return;
  }
  if (res.handler) {
    const cur = scope.handler;
    const next = handlers.get(res.handler);
    if (next && next !== cur)
      scope = { ...scope, handler: next, parent: scope };
  }

  const result = scope.handler?.map?.(res, scope!);

  if (result) {
    return result;
  }

  const hasField = isField(res);
  //isField
  return processProps(
    {
      type: hasField
        ? "Field"
        : (res.tag ?? dotToCamelCase(res.widget ?? res.type ?? "Box")),
      sType: hasField ? res.pType : (res.type ?? res.tag),
      schema: res,
      ...(res.items && {
        items: toArray(res.items)
          .map((item) => mapWidget(item, scope, level + 1))
          .filter(Boolean),
      }),
    },
    res,
    scope,
  );
}

const rawTypes = ["$text", "h", "html"];
function processProps(block: any, res: Schema, scope: BlockScope): any {
  if (rawTypes.includes(res.type)) {
    if (block.sType === "$text") {
      block.type = "text";
      block.items = (res as any).text;
    } else {
      if (block.sType === "h") {
        let content = (res as any).content;
        if (typeof content === "string") {
          content = miniRender(content);
        }
        block.tag = block.sType;
        block.content = content;
        block.render = ({ ctx }: { ctx: object }) => content(ctx);
      } else if (block.sType === "html") {
        let content = (res as any).content;
        if (typeof content === "string") {
          content = evalExpr(content);
        }
        const Tag = (res as any).tag ?? ("div" as keyof JSX.IntrinsicElements);
        block.tag = Tag;
        block.content = content;
        block.render = ({ ctx }: { ctx: object }) => (
          <Tag dangerouslySetInnerHTML={{ __html: content(ctx) }} />
        );
      }
    }
    return block;
  }

  let { ctx, handler } = scope;

  evalPropSates(block, res, ctx);
  let wrapBlock = false;
  let owner: BlockHandler | undefined;
  if (handler && handler.id !== block.handler) {
    let current: BlockScope | undefined = scope;
    while (current && !current.handler?.canRender(block, res)) {
      current = current.parent;
    }
    let processor;
    if (current?.handler) {
      owner = current.handler;
      block.handler = owner.id;
      owner.init?.(block, res);
    } else if (handler.wrap) {
      wrapBlock = true;
      owner = handler;
      //handler.wrap(block, res);
    }
  }

  if (block.items) {
    const items = block.items as Block[];
    if (!items.length) {
      delete block.items;
    } else if (items.length === 1) {
      block.items = items[0];
    }
  }

  let props = evalProps(res.props, ctx);

  const widget = res as Widget;

  if (widget.slots) {
    const level = block.level ?? 0;
    const slots = widget.slots as Record<string, Widget>;
    const bSlots: any = {};
    let count = 0;
    Object.entries(slots).forEach(([key, value]) => {
      const block = mapWidget(value, scope, level + 1);
      if (block) {
        bSlots[key] = block;
        count++;
      }
    });
    if (count) block.slots = bSlots;
  }

  if ( widget.render && (owner?.id !== 'form' || block.sType !== 'Field')) {
    const scopeProps = handler?.doScope
      ? handler.doScope({ ctx, props: {} }, scope?.parent?.handler)
      : undefined;
    const render =
      typeof widget.render === "string"
        ? evalRender(widget.render, scopeProps)
        : widget.render;
    block.render = render;
  }

  if (props) {
    block.props = props;
    setComputeProps(block, props, ctx);
  }

  owner?.end?.(block);
  block = owner?.wrap?.(block, res) ?? block;

  return block;
}

function canEval(res: Schema, scope: BlockScope) {
  return res.if ? evalExpr(res.if)(scope.ctx) : true;
}

function evalProps(props: Props, ctx: any): SxProps {
  if (!props) return null;

  if (typeof props === "string") {
    props = evalExpr(props)(ctx ?? EMPTY_RECORD);
  }

  return isPlainObject(props) ? props : (props as SxProps);
}

export function evalFnProps(props: Props, ctx: any): SxProps {
  if (typeof props === "function") {
    return props(ctx);
  }
  return props;
}

const EVAL_PROPS = ["e_", "h_"] as const;
function setComputeProps(block: any, props: Props, ctx: any) {
  if (isPlainObject(props)) {
    const keys = Object.keys(props);
    if (
      !keys.some((key) => EVAL_PROPS.some((prefix) => key.startsWith(prefix)))
    )
      return;
    const fixed = {} as any;
    const computed: Record<
      string,
      ReturnType<typeof evalExpr> | ReturnType<typeof miniRender>
    > = {} as any;
    Object.keys(props).forEach((key) => {
      const prefix = key.slice(0, 2);
      if (EVAL_PROPS.includes(prefix as any)) {
        let value = props[key];
        key = key.slice(prefix.length);
        if (typeof value === "string") {
          if (value.trim().length) {
            value = prefix === "h_" ? miniRender(value) : evalExpr(value);
          }
        }
        if (typeof value === "function") {
          computed[key] = value;
        }
      } else {
        fixed[key] = props[key];
      }
    });
    if (!Object.keys(computed).length) {
      block.props = { ...fixed };
      return;
    }
    block.evalProps = (ctx: object) => {
      const result = Object.entries(computed).reduce(
        (prev, [key, fn]) => {
          console.log("Try eval:", props["e_" + key] ?? props["h_" + key]);
          prev[key] = fn(ctx);
          return prev;
        },
        { ...fixed } as any,
      );

      console.log("Eval result:", result);
      return result;
    };
    block.props = { ...fixed };
  }
}

function isContainer(widget: Widget): widget is Container {
  return (
    "items" in widget && Array.isArray(widget.items) && widget.items.length > 0
  );
}

const stateFnProps = [
  "hiddenIf",
  "requiredIf",
  "readonlyIf",
  "canSelect",
  "onClick",
  "onChange",
  "onSelect",
  "validate",
  "compute",
];
const stateProps = [
  "hidden",
  "required",
  "readonly",
  "name",
  "uid",
  "title",
  "help",
  "noTitle",
  "widget",
];
function evalPropSates(block: any, res: Schema, ctx: any) {
  for (let prop of Object.keys(res)) {
    if (stateProps.includes(prop)) {
      let value = res[prop as keyof Schema];
      if (value !== undefined) {
        block[prop] = value;
      }
    } else if (stateFnProps.includes(prop)) {
      let value = res[prop as keyof Schema];
      if (value) {
        if (typeof value === "string") {
          value = evalExpr(value);
        }
        if (typeof value === "function") block[prop] = value;
      }
    }
  }
}

function processForm(block: any, res: FormView) {
  let isSet = false;
  ["onSubmit", "validate", "onEdit", "onDelete", "onNew"].forEach((props) => {
    let value = res[props as keyof FormView];
    if (value) {
      if (typeof value === "string") {
        value = evalExpr(value);
      }
      if (typeof value === "function") {
        block[props] = value;
        isSet = true;
      }
    }
  });

  ["edit", "delete", "create"].forEach((props) => {
    let value = res[props as keyof FormView];
    if (value !== undefined) {
      block[props] = value;
      isSet = true;
    }
  });

  //block['Comp'] = ViewComponent
  block["handleId"] = res.handler ?? "form";

  return block;
}

function processFilterForm(block: any, res: FormView) {
  Object.assign(block, {
    edit: true,
    create: false,
    delete: false,
    readonly: false,
    validate:
      typeof res.validate === "string" ? evalExpr(res.validate) : res.validate,
  });
}

function processFieldViews(block: any, res: DynamicField, ctx: object) {
  const views = res.views?.map((view) => processViewBlock(view, ctx));
  if (views && views.length) {
    block["views"] = views;
  }
}

function getFlags(block: any) {
  return 0;
}

function doFlags(block: any) {
  if (Array.isArray(block)) {
    let flags = 0;
    block.forEach((b) => (flags |= doFlags(b)));
  } else if (isPlainObject(block)) {
    makeFlags(block);
    return isNumber(block.flags) ? block.flags : 0;
  }

  return 0;
}

export function makeFlags(block: Block) {
  let flags = block.flags ?? 0;
  const { props, slots, items } = block;

  if (items) {
    doFlags(items);
  }

  if (props) {
    if (typeof block.props === "function") {
      flags |= EvalFlags.PROPS_FN;
    } else if (isPlainObject(block.props) && Object.keys(block.props).length) {
      flags |= EvalFlags.PROPS;
    }
  }

  if (slots) {
    doFlags(Object.values(slots));
  }
}
