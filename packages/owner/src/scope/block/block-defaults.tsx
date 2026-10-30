import { createEvalContext, miniRender } from "~/utils/eval-context";
import React from "react";
import {
  isDevelopment,
  isReactType,
  type Block,
  type BlockRenderProps,
  type HBlock,
  type HtmlBlock,
  type Props,
} from "~/utils";
import h from "~/utils/h";
import type { BlockMeta, ComponentMeta } from "../types";

type CreateElement = typeof React.createElement;

const defaultEvalContext = createEvalContext({}, {});

type Frame = {
  allCount: number;
  count: number;
  rate: number;
  last: number;
}

function checkFrame( block: Block) {
   let bb = block as any;
   if(!bb){
      return false;
   }
   let frame = bb.$frame as Frame;
   if(!frame) {
    frame = {
      allCount: 0,
      count: 1, 
      last: Date.now(), 
      rate: 1
    }
    bb.$frame = frame
   } else{
     const maxFrame = bb.$maxFrame  ?? 1;
     frame.allCount += 1;
     const now = Date.now()
     const rate = (now - frame.last)/1000.0
     frame.last = now;
     //if(rate > 1)
     frame.rate = rate;

     if(rate >= maxFrame) {
        frame.count = 0;
     } else {
        frame.count += 1;
     }     
   }
   

  if(frame.count > 2000) {
    
    if (isDevelopment) {
      console.warn("renderDefault:: frame:", frame, ", block:", block); 
      throw new Error("Block render multiple times")
    }
    return false;
  }

  return true
}

function renderDefault(
  block: Block,
  props: Props,
  ctx?: object,
  testFrame?: boolean,
): React.ReactNode {
  const { tag , type } = block;
   
   console.log("renderDefault::", block)
   if (!block || (testFrame !== false && !checkFrame(block))) {
     return null
   }
   

   if (tag === "h") {
    let content = "content" in block ? (block.content as any) : undefined;
    if (typeof content === 'string') {
      content = miniRender(content)
      (block as any).content = content
    }
    if (typeof content === 'function') {
      return  content(ctx ?? defaultEvalContext)
    }

    return (
      <p color="red" style={{ fontSize: 8 }}>
        Block Render
      </p>
    );
  }

  if (tag && isReactType(tag)) {
    if (!props && !block.hasOwnProperty('canEval')) {
      if(!block.$rend){
        block.$rend = React.createElement(tag, props);
        return block.$rend;
      }
      return React.cloneElement(block.$rend! as React.ReactElement);
    }
 
    return React.createElement(tag, props);
  }

  let content = "content" in block ? (block.content as string) : undefined;

 

  if (type === "html" && content) {
    const Tag = (block as HtmlBlock).tag ?? "div";

    return <Tag dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (React.isValidElement(block)) {
    if (props && "ref" in props) {
      return React.cloneElement(block, props);
    }
    return block;
  }

  const hType = String(tag ?? type ?? "").toLowerCase();
  if (['div', 'span', 'label', 'h6', 'h5', 'h4', 'p', 'b', 'ul', 'li'].includes(hType)) {
      return (
      React.createElement(hType, props)
    );
  }
  return (
    <p style={{ fontSize: 8, color: 'red' }}>
      {hType} Block Render
    </p>
  );
}



function meta<P extends any = any>(
  comp: React.FunctionComponent<P>,
  meta: BlockMeta,
) {
  Object.assign(comp, { $meta: meta });
  return comp as ComponentMeta<P>;
}

function getMeta(block: any):BlockMeta|undefined  {
  return block?.$meta;
}


const H = meta(({block, ctx}:{block: HBlock, ctx?: object}) => {
  return block.content(ctx ?? defaultEvalContext)
}, {noProps: true, wrap: 'prop'})

const Html = meta(({tag, render, ctx}:{tag?: keyof React.JSX.IntrinsicElements, render: (ctx: object) => any, ctx?: object}) => {
  const Tag = tag ?? "div";
  
  return <Tag dangerouslySetInnerHTML={{ __html: render(ctx ?? defaultEvalContext) }} />; 
}, {noProps: true, raw: true})




function getRawRender(block: any) {
  let { tag = "other", type, content } = block;
  if (tag === "h") {
    if (content) {
      if (!content.trim().startsWith("return")) {
        content = "return " + content;
      }

      const fn = new Function("h", "ctx", content);
      return ({ ctx }: BlockRenderProps) => {
        return fn(h, ctx ?? defaultEvalContext);
      };
    }
    return (
      <p color="red" style={{ fontSize: 8 }}>
        Block Render
      </p>
    );
  }
}

export { defaultEvalContext, renderDefault, meta, H, Html, getMeta, checkFrame };
