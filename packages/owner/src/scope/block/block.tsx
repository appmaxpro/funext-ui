import * as React from "react";
import {
  useEvalDataContext,
  useViewBlock
} from "~/context";
import {
  EMPTY_ARRAY,
  EMPTY_RECORD,
  isPlainObject,
  type Block,
  type SxProps
} from "~/utils";

import { defaultEvalContext, renderDefault, checkFrame } from "./block-defaults";
import { evalFnProps, getHandlerRender } from "./block-processor";

export type EvalProps = (block: Block, ctx: any) => SxProps;
export type BlockFilter = (block: Block) => boolean;

export const RenderBlock = ({ block, ctx }: { block: Block; ctx: object }) => {
  return renderBlock(block, ctx);
};

RenderBlock.displayName = "RenderBlock";



export function evalProps(block: Block, ctx: object) {
  if (!block || !isPlainObject(block)) {
    return undefined;
  }

  return evalPropsAndSlots(block, ctx);
}

function evalPropsAndSlots(block: Block, ctx: object) {
  
  let props = evalFnProps((block as any).evalProps ?? block.props, ctx);
  props = evalSlots(block, ctx, props);


  return props;
}

function evalSlots(block: Block, ctx: object, props?: any) {
  if (block.slots) {
    props = props || {};
    Object.entries(block.slots).forEach(
      ([key, block]) => (props[key] = <RenderBlock block={block} ctx={ctx} />),
    );
  }
  return props;
}

export function getBlockItem(block: Block, index: number) {
  const items = Array.isArray(block.items) ? block.items : [block.items];
  return items[index];
}

export function blockToArray(block?: Block|Block[]) {
   if (!block) return EMPTY_ARRAY as Block[];
   return Array.isArray(block) ? block : [block]
}


export function getBlockItems(block?: Block) {
  if (!block) return EMPTY_ARRAY as Block[];
  
  const items = Array.isArray(block.items)
    ? block.items.filter(Boolean)
    : block.items
      ? [block.items]
      : EMPTY_ARRAY;
  return items as Block[];
}

export function renderBlockItems(
  block: Block,
  ctx: object,
  filter?: BlockFilter,
) {
  let items = getBlockItems(block);
  if (!items.length) return undefined;
  if (filter) {
    items = items.filter(filter);
    if (!items.length) return undefined;
  }

  if (items.length === 1) {
    return renderBlock(items[0], ctx)
    //return <RenderBlock block={items[0]} ctx={ctx} />;
  }

  const children = items.map((block, idex) => (
    <RenderBlock block={block} ctx={ctx} key={idex} />
  ));

  return children;
}

//function evalBlockSlots(
function evalAllProps(block: Partial<Block>, ctx: object, ref?: any): any {
  if (!block || !isPlainObject(block)) {
    return undefined;
  }

  const empty: any = EMPTY_RECORD;
  const children = renderBlockItems(block, ctx);

  let inProps = evalPropsAndSlots(block, ctx) ?? empty;

  if (ref) {
    inProps = { ...inProps, ref };
  }

  return children ? { ...inProps, children } : inProps;
}

function renderBlock(block: Block, ctx: object, ref?: any, handle?: boolean): React.ReactNode {
  if (!block || !isPlainObject(block)) {
    return block as React.ReactNode;
  }

  if (block.type === "$text") {
    return (block as any).text;
  }

  checkFrame(block)

  if ('$rend' in block) {
    const rend = block.$rend;
    console.log("renderBlock has rend block:", block);
    if (ref) {
      if (React.isValidElement(rend)) return React.cloneElement(rend, { ref });
    }
    return rend;
  }

  if (block.render) {
    return block.render({
      ctx,
      ref,
      get props() {
        return evalAllProps(block, ctx, ref);
      },
    });
  }

  const handler = getHandlerRender(block);
  if (handler) {
    try {
      return handler.render(block, {
        ref,
        props: () => evalAllProps(block, ctx, ref),
        params: {
          ctx,
          render: (props) => {
            
            return renderDefault(block, props, ctx, false);
          },
        },
        
      });
    } finally {
      ref = undefined;
    }
  }

  //const { tag = "other", type, ...rest } = block;
  let props = evalAllProps(block, ctx, ref);

  return renderDefault(block, props, ctx, false);
}

export function useRenderBlock<B extends Block>() {
  //const factory = useBlockContext();
  return (block: B, context?: object, ref?: any) =>
    renderBlock(block, context ?? defaultEvalContext, ref);
}

export function unSafeRenderBlock<B extends Block>(
  block: B,
  context?: object,
  ref?: any,
) {
  return renderBlock(block, context ?? defaultEvalContext, ref);
}

export const BlockComponent = ({
  block,
  ctx,
  ref,
}: {
  block?: Block;
  ctx: object;
  ref?: any;
}) => {
  const render = useRenderBlock();
  const cxBlock = useViewBlock();

  return React.useMemo(() => render(block ?? cxBlock!, ctx, ref), [block, ctx]);
};

BlockComponent.displayName = "BlockComponent";

export const BlockView = React.memo(
  ({ ref }: { ref?: any }) => {
    const block = useViewBlock();
    const ctx = useEvalDataContext();

    return React.useMemo(() => renderBlock(block, ctx, ref), [block]);
  },
);

BlockView.displayName = "BlockView";


export const WrapRenderBlock = ({ block, ctx }: { block: Block; ctx: object }) => {
  
  return renderBlock(block, ctx);
};