import { useCallback, useState } from "react";

import React from "react";
import { useEvalDataContext } from "~/context";
import { evalProps, renderBlockItems, renderDefault, unSafeRenderBlock } from "~/scope";
import {
  type DataContext,
  type WidgetBlock
} from "~/utils";
import app from "~/utils/app";

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
        const confirmed = await app.dialogs.confirm(prompt, {
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
          await onClick(ctx);
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

  return disabled ? { ...props, disabled } : { ...props, onClick };
}

function doEvalProps(block: WidgetBlock, ctx: DataContext, ref?: any) {
  let props = evalProps(block, ctx) ?? {};
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
  (block as any).xProps = props;

  return props;
}

export const useEvalRenderBlock = (block: WidgetBlock, ref?: any) => {

  const ctx = useEvalDataContext();
  let { hidden, ...props } = React.useMemo<any>(
    () => doEvalProps(block, ctx, ref),
    [ctx, ref, block],
  );

  if (block.onClick) {
    props = useClick(block, ctx, props);
  }

  if (hidden) {
    return null;
  }
  return renderDefault(block, props, ctx);
  //return unSafeRenderBlock(block, props, ctx);
};
