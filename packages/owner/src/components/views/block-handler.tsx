import React from "react";
import {
  EMPTY_RECORD,
  isField,
  processWidget,
  type BlockHandler,
  type BlockRenderProps,
  type Container,
  type FormView,
  type ResourceView,
  type Schema,
  type Widget,
  isPlainObject,
  type Block,
  toCamelCase,
} from "~/utils";
import {
  type Props,
  type SchemaBlock,
  type SxProps,
  type ViewBlock,
} from "~/utils/block-types";
import { evalExpr, evalRender } from "~/utils/eval-context";

const handlers = new Map<string, BlockHandler<any>>();

export function registerBlockHandlers<S extends Block = any>(
  id: string,
  handler:
    | BlockHandler<S>
    | ((get: (id: string) => BlockHandler<any> | undefined) => BlockHandler<S>),
) {
  if (typeof handler === "function") {
    handlers.set(id, handler(handlers.get.bind(handlers)));
  } else {
    handlers.set(id, handler);
  }
}

export const nullResourceView: ResourceView = {
  type: "list",
  items: [],
  name: "null",
  uid: "0",
} as const;

const viewCache = new WeakMap<ResourceView, ViewBlock>();

export function processViewBlock<R extends ResourceView>(res: R, ctx: any) {
  const found = viewCache.get(res);
  if (found) return found;
  const block = processView(res, ctx);
  viewCache.set(res, block as ViewBlock);

  return block as ViewBlock<R>;
}

type BlockScope = {
  root?: ResourceView;
  scope: string;
  ctx: any;
  handler?: BlockHandler;
  parent?: BlockScope;
  handlers: Array<BlockHandler>;
};

function processView(res: ResourceView, ctx: any): SchemaBlock {
  let others: any;
  const vHandlers: BlockHandler[] = [];
  if (res.handler && handlers.has(res.handler))
    vHandlers.push(handlers.get(res.handler)!);

  const scope = {
    root: res,
    scope: res.type,
    ctx,
    handler: vHandlers[0],
    handlers: vHandlers,
  };

  const result = handleSchema(res, scope);
  if (result) {
    return result;
  }

  if (res.type === "form") {
    others = processForm({}, res as FormView);
  }

  return processProps(
    {
      ...others,
      type: res.type,
      items: res.items.map((item) => mapWidget(item, scope)),
      schema: res,
    },
    res,
    ctx,
  );
}

function handleSchema(res: Schema, scope: BlockScope) {
  if (!res.uid) res = processWidget(res, scope.ctx);

  return scope.handler?.map?.(res, scope);
}

export function getHandlerRender<B extends { handler?: string }>(block: B) {
  return block.handler ? handlers.get(block.handler) : undefined;
}

function mapWidget(res: Widget, scope: BlockScope): SchemaBlock {
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

  if (isContainer(res)) {
    return processProps(
      {
        type: hasField ? "Field" : toCamelCase(res.widget ?? res.type ?? "Box"),
        sType: hasField ? res.pType : res.type,
        items: res.items.map((item) => mapWidget(item, scope)),
        schema: res,
      },
      res,
      scope,
    );
  }

  //isField
  return processProps(
    {
      type: hasField ? "Field" : toCamelCase(res.widget ?? res.type ?? "Box"),
      sType: hasField ? res.pType : res.type,
      schema: res,
    },
    res,
    scope,
  );
}

function processProps(block: any, res: Schema, scope: BlockScope): any {
  const { ctx, handler } = scope;
  evalPropSates(block, res, ctx);

  if (handler) {
    let current: BlockScope | undefined = scope;
    while (current && !current.handler?.canRender(block, res)) {
      current = current.parent;
    }
    block.handler = current?.handler?.id;
    current?.handler?.init?.(block, res);
  }

  let props = evalProps(res.props, ctx);

  if (props && isPlainObject(res.props)) evalPropValues(props, ctx);

  const widget = res as Widget;

  if ("sx" in res) {
    const sx = evalProps(res.sx, ctx);
    if (sx) {
      props = props || {};
      props.sx = sx;
    }
  }

  if (widget.slots) {
    const slots = widget.slots as Record<string, Widget>;
    const bSlots: any = {};
    Object.entries(slots).forEach(
      ([key, value]) => (bSlots[key] = mapWidget(value, scope)),
    );
    block.slots = bSlots;
  }

  if (widget.render) {
    const render =
      typeof widget.render === "string"
        ? evalRender(widget.render)
        : widget.render;
    let scopedProps: BlockRenderProps | undefined;
    block.render = (props: BlockRenderProps) => {
      if (scopedProps) {
        props = { ...scopedProps, ...props };
      } else if (handler?.doScope) {
        scopedProps = handler.doScope(props, scope?.parent?.handler);
        props = scopedProps;
      }
      return render(props);
    };
  }

  if (props) {
    block.props = props;
  }

  return block;
}

function evalProps(props: Props, ctx: any): SxProps {
  if (!props) return null;

  if (typeof props === "string") {
    props = evalExpr(props)(ctx ?? EMPTY_RECORD);
  }

  return isPlainObject(props) ? { ...props } : (props as SxProps);
}

export function evalFnProps(props: Props, ctx: any): SxProps {
  if (typeof props === "function") {
    props = props(ctx);
  }

  evalPropValues(props, ctx, "$");

  return props;
}

function evalPropValues(props: Props, ctx: any, suffix: string = "$$") {
  if (isPlainObject(props)) {
    Object.keys(props).forEach((key) => {
      if (key.startsWith(suffix)) {
        let value = props[key];
        delete props[key];

        key = key.slice(suffix.length);
        if (typeof value === "string") {
          value = evalExpr(value)(ctx ?? EMPTY_RECORD);
          props[key] = value;
        } else if (typeof value === "function") {
          props[key] = value(ctx);
        }
      }
    });
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
const stateProps = ["hidden", "required", "readonly"];
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
  ["onSubmit", "onEdit", "onDelete", "onNew"].forEach((props) => {
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
