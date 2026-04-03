import { useCallback, useRef, useState } from "react";

import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  type DataContext,
  type WidgetBlock,
} from "~/utils";
import { dialogs } from "~/hooks/use-dialogs";
import { useEvalDataContext } from "~/context";
import React from "react";
import { evalProps, renderBlockItems, renderDefault, unSafeRenderBlock } from "~/scope";

export function useClick(block: WidgetBlock, ctx: DataContext, inProps?: any) {
  const schema = block.schema;

  const props = inProps ?? {};

  const [wait, setWait] = useState(false);

  const disabled = props.disabled || wait;

  const onClick = useCallback(
    async (e: Event) => {
      const { prompt, link, action } = props;
      const { onClick } = block;

      if (prompt) {
        const confirmed = await dialogs.confirm(prompt, {
          severity: "warning",
        });

        if (!confirmed) return;
      }
      if (link) {
        return link && window.open(link, "_self", "noopener,noreferrer");
      }
      try {
        e.preventDefault();
        setWait(true);

        //await form.executer.waitFor();
        if (onClick) {
          await onClick(e);
        }
        if (typeof action !== "string") {
          return;
        }
        await (ctx as any)._execute(action, {
          context: {
            _source: schema.name,
            _signal: schema.name,
          },
        });
      } finally {
        setWait(false);
      }
    },
    [ctx],
  );

  return disabled ? { ...props, disabled, onClick } : { ...props, onClick };
}

function doEvalProps(block: WidgetBlock, ctx: DataContext, ref?: any) {
  let props = evalProps(block, ctx);
  if (block.hideIf) {
    props.hidden = block.hideIf(ctx);
  } else if (block.hidden != null) {
    props.hidden = block.hidden;
  }
  if (!props.hidden && block.items) {
    const children = renderBlockItems(block, ctx);
    if (children) {
      props.children = children;
    }
  }
  if (ref) {
    props.ref = ref;
  }

  return props;
}

export const useEvalRenderBlock = (block: WidgetBlock, ref?: any) => {
  const originBlock = React.useMemo(() => {
    return block.items as WidgetBlock;
  }, [block]);

  const ctx = useEvalDataContext();
  let { hidden, ...props } = React.useMemo<any>(
    () => doEvalProps(originBlock, ctx, ref),
    [ctx, ref],
  );

  if (originBlock.onClick) {
    props = useClick(originBlock, ctx, props);
  }

  if (props.hidden) {
    return null;
  }

  return unSafeRenderBlock(originBlock, props, ctx);
};
