import KeyboardArrowDown from "@funext/icons/KeyboardArrowDown";
import {
  Card,
  Collapse,
  Flex,
  Grid,
  IconButton,
  Panel,
  Text,
  useEvent,
} from "@funext/ui";
import { isPlainObject } from "lodash";
import * as React from "react";
import { useResourceContext, useViewBlockContext } from "~/context";
import {
  EMPTY_ARRAY,
  EMPTY_RECORD,
  isField,
  type Schema,
  type SxProps,
} from "~/utils";
import { createEvalContext } from "~/utils/eval-context";
import {
  type Block,
  type BlockCardProps,
  type BlockProps,
  type Props,
} from "../../utils/block-types";
import { evalFnProps, getHandlerRender } from "./block-handler";

const RenderBlock = ({
  block,
  params,
}: {
  block: Block;
  params: BlockParams;
}) => {
  return renderBlock(block, params);
};

RenderBlock.displayName = "RenderBlock";

export type RenderFactory = {
  render: typeof React.createElement;
};

export type evalProps = (block: Block, ctx: any) => SxProps;

type BlockParams = {
  factory: RenderFactory;
  ctx: object;
  key?: any;
  evalSlots?: boolean;
  render?: boolean;
  ref?: any;
};

function evalSlots(block: Block, params: BlockParams) {
  let props = evalFnProps(block.props, params.ctx);
  /*
  if ("schema" in block && isField(block.schema! as Schema)) {
    props = props ?? {};
    props.field = block;
    
    if (isField(block.schema! as Schema)) {
      props.field = block;
    } else {
      props.block = block;
    }
  }*/

  if (block.slots && params.evalSlots !== false) {
    props = props || {};
    Object.entries(block.slots).forEach(
      ([key, block]) =>
        (props[key] = <RenderBlock block={block} params={params} />),
    );
  }
  return props;
}

//export type BlockContextFactory = {

const defaultBlockFactory = {
  render: React.createElement,
};

export type EvalContext = {
  ctx: object;
  env: object;
  parent?: EvalContext;
};

export const BlockContext =
  React.createContext<RenderFactory>(defaultBlockFactory);

export const useBlockContext = () => {
  return React.useContext(BlockContext) ?? defaultBlockFactory;
};

export const EvalBlockContext = React.createContext<object>(EMPTY_RECORD);

export const useEvalBlockContext = () => {
  const context = React.useContext(EvalBlockContext);
  const { tab } = useResourceContext();
  const ctx = tab?.action.evalContext ?? defaultEvalContext;
  return context ?? ctx;
};

function renderItems(block: Block, params: BlockParams) {
  if (block.items) {
    const items = Array.isArray(block.items) ? block.items : [block.items];
    const children = items
      .map((block, idex) => (
        <RenderBlock block={block} params={params} key={idex} />
      ))
      .filter(Boolean);
    return children;
  }

  return null;
}

//function evalBlockSlots(
function evalProps(
  block: Partial<Block>,
  params: BlockParams,
  ref?: any,
  tag?: Block["tag"],
): any {
  if (!block || !isPlainObject(block)) {
    return block;
  }

  tag ??= block.tag;

  const empty: any = EMPTY_RECORD;
  const children = renderItems(block, params);

  let inProps = evalSlots(block, params) ?? empty;

  if (ref) {
    inProps = { ...inProps, ref };
  }

  switch (tag) {
    case "block": {
      const { label, ...props } = inProps;
      //isPlainObject(label)
      return {
        ...props,
        children,
        label: evalProps(label, params, "text"),
      };
    }
    case "card": {
      const { header, ...props } = inProps;
      return {
        ...props,
        header: evalProps(header, params, "header"),
      };
    }
    case "header": {
      const { title, subheader, ...props } = inProps;
      return {
        ...props,
        children,
        title: renderBlock(title, params),
        subheader: renderBlock(subheader, params),
      };
    }
  }

  return children ? { ...inProps, children } : inProps;
}

function renderBlock(
  block: Block,
  params: BlockParams,
  ref?: any,
): React.ReactNode {
  if (!block || !isPlainObject(block)) {
    return block as React.ReactNode;
  }
  if (params.ref) {
    ref ??= params.ref;
    params = { ...params };
    delete params.ref;
  }

  if (block.render) {
    return block.render({
      block,
      ctx: params.ctx,
      props: (options) =>
        evalProps(
          options?.block ?? block,
          options ? { ...params, ...options } : params,
          (options?.ref ?? (options?.block ?? block) === block)
            ? ref
            : undefined,
        ),
      render: (out, options) =>
        out === block
          ? renderDefault(out ?? block, params, ref)
          : renderBlock(block, options ? { ...params, ...options } : params),
    });
  }

  const handler = getHandlerRender(block);
  if (handler) {
    try {
      return handler.render({
        block,
        ctx: params.ctx,
        props: (out) => evalProps(out ?? block, params, ref),
        render: (out) =>
          out === block
            ? renderDefault(out ?? block, params, ref)
            : renderBlock(out ?? block, params),
      });
    } finally {
      ref = undefined;
    }
  }

  //const { tag = "other", type, ...rest } = block;

  return renderDefault(block, params, ref);
}

function renderDefault(
  block: Block,
  params: BlockParams,
  ref?: any,
): React.ReactNode {
  const { tag = "other", type, ...rest } = block;

  let props = evalProps(rest, params, ref, tag);

  switch (tag) {
    case "block": {
      return React.createElement(Block, props);
    }
    case "panel": {
      return React.createElement(Panel, props);
    }

    case "card": {
      const { expandable, header, children, ...rest } = props;
      const Comp = expandable ? BlockCard : Card;
      return React.createElement(
        Comp as any,
        header ? { ...rest, header } : rest,
        children,
      );
    }

    case "header": {
      return React.createElement(Card.Header, props);
    }

    case "body": {
      return React.createElement(Card.Body, props);
    }
    case "footer": {
      return React.createElement(Card.Footer, props);
    }
    case "grid": {
      return React.createElement(Grid, props);
    }
    case "text": {
      return React.createElement(Text, props);
    }
  }
  if (React.isValidElement(block)) {
    return block;
  }

  return params.factory.render(tag, props);
}

const Block = ({
  label,
  children,
  justify = "between",
  ...rest
}: BlockProps) => {
  return (
    <Flex justify={justify} items="center" {...rest}>
      {label && <span>{label}:</span>}
      {children}
    </Flex>
  );
};

const BlockCard = ({
  open: expandedProps = true,
  header,
  children,
  ...props
}: Omit<BlockCardProps, "expandable">) => {
  const [open, setOpen] = React.useState(expandedProps);

  return (
    <Card {...props}>
      <Card.Header
        action={
          <IconButton
            onClick={React.useCallback(
              () => setOpen((open) => !open),
              EMPTY_ARRAY,
            )}
          >
            <KeyboardArrowDown
              className={`${open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
            />
          </IconButton>
        }
        {...header}
      />
      <Collapse open={open}>{children}</Collapse>
    </Card>
  );
};

const ItemBlock = () => {
  return <div>Item</div>;
};

const EvalBlock = ({
  Comp,
  props: evalProps,
}: {
  Comp: React.ComponentType;
  props: Props;
}) => {
  const ctx = useEvalBlockContext();
  const [props, setProps] = React.useState<any>(null);
  const [childCtx, setChildCtx] = React.useState<any>(null);

  React.useEffect(() => {
    const { fields, context, ...props } = evalFnProps(evalProps, ctx);
    const helper = (ctx as any)._extends({
      get _parent() {
        return ctx;
      },
    });

    const newCtx = createEvalContext(context, helper);

    setChildCtx(newCtx);
    setProps(Object.create(props ?? EMPTY_RECORD));
  }, [ctx]);

  if (!props || !childCtx) {
    return null;
  }
  return (
    <EvalBlockContext.Provider value={childCtx}>
      {React.createElement(Comp, props)}
    </EvalBlockContext.Provider>
  );
};

const cache = new WeakMap<React.ComponentType, typeof EvalBlock>();

function createEvalBlock(Comp: React.ComponentType) {
  let EvalComp = cache.get(Comp);
  if (!EvalComp) {
    EvalComp = (evalProps: Props) => (
      <EvalBlock Comp={Comp} props={evalProps} />
    );
    cache.set(Comp, EvalComp);
    Object.getOwnPropertyNames(Comp).forEach((key) => {
      if (key === "length" || key === "name" || key === "prototype") {
        return;
      }

      (EvalComp as any)[key] = (Comp as any)[key];
    });
  }

  return EvalComp;
}

export const BlockContextProvider = ({
  render: thisRender,
  children,
  elements,
}: RenderFactory & { elements?: Array<any>; children: React.ReactNode }) => {
  const parent = useBlockContext();
  const thisRenderCp = useEvent(thisRender);
  const render = React.useCallback(
    (type: any, props: any, ...children: React.ReactNode[]) => {
      if (elements && !elements.includes(type)) {
        return parent?.render(type, props, children);
      }
      let result = thisRenderCp(type, props, children);
      return result ?? parent?.render(type, props, children);
    },
    [parent],
  ) as typeof React.createElement;

  const createMemo = React.useMemo(() => ({ render }), [render]);

  return (
    <BlockContext.Provider value={createMemo}>{children}</BlockContext.Provider>
  );
};

const defaultEvalContext = createEvalContext({}, {});

export function useRenderBlock<B extends Block>() {
  const factory = useBlockContext();
  return (block: B, context: object) =>
    renderBlock(block, { factory, ctx: context ?? defaultEvalContext });
}

export const BlockComponent = ({
  block,
  ctx,
}: {
  block?: Block;
  ctx: object;
}) => {
  const render = useRenderBlock();
  const cxBlock = useViewBlockContext();

  return React.useMemo(() => render(block ?? cxBlock!, ctx), [block, ctx]);
};

BlockComponent.displayName = "BlockComponent";
