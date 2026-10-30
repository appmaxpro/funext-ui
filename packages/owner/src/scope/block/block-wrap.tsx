import { isPlainObject, omit, type Block, type SchemaBlock, type SxProps, type WidgetBlock } from "~/utils";
import type { BlockMeta } from "../types";
import React from "react";
import { WidgetBlockProvider } from "./providers";
import { isEmpty } from "lodash";
import { renderDefault } from "./block-defaults";


function mergeRef(props: any, ref?: any) {
  if (!ref) return props;
  if (props) {
    return props.ref ? props : { ...props, ref };
  }
  return { ref };
}

export function wrapBlock(
  block: Block,
  CP: React.ElementType,
  props: any,
  ref?: any,
  meta?: BlockMeta,
  ctx?: any
) {
  console.log("Handler wrapBlock block: ", {block, meta})
  if (meta) {
    if (isPlainObject(meta)) {
      const wrap = meta.wrap;

      if (meta.noProps) {
        let node: any;
        if (wrap === "prop"){
          //console.error("wrapBlock block:", block);
          node = React.createElement(CP, mergeRef({ block }, ref));
        }
        else if (wrap === "context") {
          node = React.createElement(
            WidgetBlockProvider,
            { block: block as WidgetBlock },
            React.createElement(CP, ref ? { ref } : undefined),
          );
        } else if (typeof wrap === "function") {
          node = React.createElement(wrap, mergeRef({ CP, block }, ref));
        } else {
          node = ref
            ? React.createElement(CP, { ref })
            : React.createElement(CP);
        }
        block.$rend = node;
        return node;
      }
      let node: any;
      let inProps = typeof props === 'function' ? props() : props;
      const mProps = mergeRef(
        meta.props ? meta.props(block, inProps) : inProps,
        ref,
      );
      //const propsNoRef = mProps ? omit(mProps, ['ref']) : mProps;
      if (wrap === "prop") node = React.createElement(CP, { ...mProps, block });
      else if (wrap === "context") {
        node = React.createElement(
          WidgetBlockProvider,
          { block: block as WidgetBlock },
          React.createElement(CP, mProps),
        );
      } else if (typeof wrap === "function") {
        node = React.createElement(wrap, mergeRef({ CP, block }, ref));
      } else {
        node = React.createElement(CP, mProps);
        if('evalProps' in block) {
          return node;
        }
      }

      block.$rend = node;
      return node;
    }
  } else if(!('evalProps' in block)){
    let inProps = typeof props === 'function' ? props() : props;
    const mProps = mergeRef(inProps, ref);
    const propsNoRef = mProps ? omit(mProps, ["ref"]) : mProps;
    if (isEmpty(propsNoRef) && isEmpty(block.props)) {
      block.$rend = React.createElement(CP, mProps);
      return block.$rend;
    }
    return React.createElement(CP, mProps);
  }
  let inProps = typeof props === 'function' ? props() : props;
  return renderDefault(block, ref ? { ...inProps, ref } : inProps, ctx)
}

export {
  mergeRef as mergeBlockRef
}