import { EMPTY_ARRAY, isStatefulBlock, type Block, type WidgetBlock } from "~/utils";
import { Box, useLazyRef } from "~/ui";
import { useFormWidgetState, WidgetStateProvider } from "./root";
import type { EditableFormState, IWidgetState, IWState } from "../../../types";
import {
  evalProps,
  getBlockItems,
  mergeBlockRef,
  meta,
  renderBlockItems,
  renderDefault,
  unSafeRenderBlock,
} from "../../../block";
import React from "react";
import { useFormContext } from "~/context";
import { useClick } from "./hooks";
import { wrapDefault } from "~/scope/block/block-wrap-default";
import { getWidgetStateForm } from "~/scope/utils/view-utils";


//function RenderCopyBlock


function Button({ widget, ref, defaults }: { widget: IWidgetState; ref?: any; defaults?: boolean; }) {
  const { disabled, onClick } = useClick(widget);
  const form = React.useMemo(()=> getWidgetStateForm(widget) as EditableFormState, [widget]) 
  const childBlock = React.useMemo(
    () => {
      let items = getBlockItems(widget.block);
      let item = items[0]
      if(item && form) {
        let props = widget.state.props;
        return {
          ...item,
          props: {...evalProps(item, form.context), ...props}
        }
      }
    },
    [form],
  ) as Block;

  if (!childBlock) return null

  childBlock.props = {... widget.state.props, disabled, onClick} as any;
  return unSafeRenderBlock(childBlock, widget.context, ref)
}

type StatefulWidgetProps = { ref?: any, defaults?: boolean; };




export const StatefulWidget = ({ ref, defaults}: StatefulWidgetProps) => {
   const { state, widget } = useFormWidgetState();
  const { hidden } = state;
  if (hidden) {
    return null;
  }

  let props = state.props;
  if (widget.block.onClick || (props && "action" in props)) {
    return <Button ref={ref} widget={widget} defaults={defaults}/>;
  }

  const children = renderBlockItems(widget.block, widget.context);

  props = mergeBlockRef(children ? { ...props, children } : props, ref);

  if(defaults)
    return renderDefault(widget.block, props, widget.context)
  const Tag = (widget.block.tag as React.JSX.ElementType) ?? Box;
  return <Tag {...props} />;
};

type StatelessProps = { block: WidgetBlock; defaults?: boolean; ref?: any };

const WrapWidget = React.memo<StatelessProps>(({ block, ref }) => {
  return (
    <WidgetStateProvider widget={block}>
      <StatefulWidget ref={ref}  />
    </WidgetStateProvider>
  );
})


export const StatelessWidget = React.memo<StatelessProps>(({ block, defaults, ref }) => {
  const form = useFormContext();
  //console.error("StatelessWidget BlockItems:", getBlockItems(block));
  return useLazyRef(() => {
    //console.error("StatelessWidget block vggg:", block);
    const children = renderBlockItems(block, form.context);
    
    const props = mergeBlockRef(
      children
        ? { ...evalProps(block, form.context), children }
        : evalProps(block, form.context),
      ref,
    );

    if(defaults) {
      return renderDefault(block, props, form.context)
    }

    return <Box {...props} />;
  }).current;
});

type StateWidgetProps = {
  block: WidgetBlock;
  ref?: any;
  LES?: React.ComponentType<StatelessProps>;
  FUL?: React.ComponentType<StatefulWidgetProps>;
  defaults?: boolean;
};

export const StateWidget = React.memo<StateWidgetProps>(
  ({ block, ref, FUL, LES, defaults }) => {
    if (!block) throw Error("Invalid null block");
    ///console.error("StateWidget block:", block);
    return useLazyRef(() => {
      if (isStatefulBlock(block)) {
        const CP = FUL ?? StatefulWidget;
        return (
          <WidgetStateProvider widget={block}>
            <CP ref={ref} defaults={defaults}/>
          </WidgetStateProvider>
        );
      }
      const CP = LES ?? StatelessWidget;
      return <CP block={block} ref={ref} defaults={defaults}/>;
    }).current;
  },
);

export const StatefulChild = ({ ref }: StatefulWidgetProps) => {
  const { state, widget } = useFormWidgetState();
  const { hidden } = state;
  if (hidden) {
    return null;
  }
};

export const Pane = meta(StateWidget, { wrap: "prop", noProps: true });

export const Wrapper = meta(WrapWidget, { wrap: "prop", noProps: true });