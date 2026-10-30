import { isStatefulBlock, type WidgetBlock } from "~/utils";
import { useLazyRef } from "~/ui";
import {
  evalProps,
  mergeBlockRef,
  renderBlockItems,
  renderDefault,
} from "~/scope/block";
import React from "react";
import { useEvalDataContext } from "~/context";
import { useEvalRenderBlock } from "./hooks";

type Props = {
  block: WidgetBlock;
  ref?: any;
};

export const StatefulWidget = ({ block, ref }: Props) => {
  return useEvalRenderBlock(block, ref);
};

export const StatelessWidget = React.memo<Props>(({ block, ref }) => {
  const ctx = useEvalDataContext();
  return useLazyRef(() => {
    const children = renderBlockItems(block, ctx);
    const props = mergeBlockRef(
      children ? { ...evalProps(block, ctx), children } : evalProps(block, ctx),
      ref,
    );
    return renderDefault(block, props, ctx);
  }).current;
});

type StateWidgetProps = {
  block: WidgetBlock;
  ref?: any;
  LES?: React.ComponentType<Props>;
  FUL?: React.ComponentType<Props>;
};

export const StateWidget = React.memo<StateWidgetProps>(
  ({ block, ref, ...rest }) => {
    return useLazyRef(() => {
      if (isStatefulBlock(block)) {
        const CP = rest.FUL ?? StatefulWidget;
        return <CP block={block} ref={ref} />;
      }
      const CP = rest.LES ?? StatelessWidget;
      return <CP block={block} ref={ref} />;
    }).current;
  },
);


StateWidget.displayName = "ListStateWidget";

