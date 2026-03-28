import { createEvalContext } from "~/utils/eval-context";
import { evalProps, renderBlockItems } from "./block";
import { EMPTY_OBJECT, type Props, type WidgetBlock } from "~/utils";
import { evalFnProps } from "./block-processor";
import React from "react";
import { meta } from "./block-defaults";
import { useEvalDataContext } from "~/context";


const EvalBlock = meta(React.memo(({
  CP,
  block,
  ref
}: {
  CP?: React.ElementType;
  block: WidgetBlock;
  ref?: any;
}) => {
  const ctx = useEvalDataContext();
  const {hidden, ...props} = React.useMemo<any>(()=> {
    let props = evalProps(block, ctx);
    if(block.items) {
      const children = renderBlockItems(block, ctx);
      if(children) {
         props.children = children;
      }
    }
    if(block.hideIf) {
      props.hidden = block.hideIf(ctx)
    } else if(block.hidden != null){
      props.hidden = block.hidden
    }

    return props

  }, [ctx]);

  if(hidden || !block.tag) {
    return null;
  }

  const Comp = CP ?? block.tag as  React.ElementType;

  return (
    <Comp {...props} ref={ref}/>
  );

}), { wrap: "prop", noProps: true });

EvalBlock.displayName = 'EvalBlock'

export {EvalBlock}