import React from "react";
import { type Block, type WidgetBlock } from "~/utils";
import { getMeta, renderDefault } from "./block-defaults";
import { WidgetBlockProvider } from "./providers";

export function wrapDefault(block: Block, props?: any, ctx?: any) {
  const meta = block.tag && getMeta(block.tag);

  if (meta) {
    if (meta.props) {
      props = meta.props(block, props);
    }

    if (meta.wrap === "prop") {
      return renderDefault(block, { ...props, block }, ctx);
    } else if (meta.wrap === "context") {
      return React.createElement(
        WidgetBlockProvider,
        { block: block as WidgetBlock },
        renderDefault(block, props, ctx),
      );
    } else if (typeof meta.wrap === "function") {
      return React.createElement(meta.wrap, {
        CP: block.tag as React.ElementType,
        block,
      });
    }
  }

  return renderDefault(block, props, ctx);
}
