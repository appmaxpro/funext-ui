import { List } from "../views/list/list-view";
import { FilterForm } from "../filter";
import { BaseBlockHandler, registerBlockHandlers } from "./block-processor";

import get from "lodash/get";
import React from "react";
import { Items } from "~/components/shared/items";
import { Form } from "~/scope/views/form/form-view";
import { useEvalDataContext } from "~/context";
import {
  isReactType,
  isStatefulBlock,
  type Block,
  type BlockHandler,
  type Schema,
  type SchemaBlock,
  type WidgetBlock,
} from "~/utils";
import type { BlockMeta } from "../types";
import { renderBlockItems } from "./block";
import { getMeta, meta } from "./block-defaults";
import { wrapBlock } from "./block-wrap";

export const F = meta<{ block: Block }>(
  ({ block }) => {
    const ctx = useEvalDataContext();
    return <>{renderBlockItems(block, ctx)}</>;
  },
  { noProps: true, wrap: "prop", raw: true },
);

const Icon = meta(Items.Icon, { raw: true });

export default function registerDefaultHandlers() {
  function memos(get: (tag: string) => any) {
    const memo = {} as any;
    const get2 = (tag: string, tag2?: string) => {
      const val = get(tag);
      if (!val && tag2) {
        return (memo[tag] = memo[tag2] = get(tag2));
      } else if (tag2) {
        return (memo[tag] = memo[tag2] = val);
      }
      return (memo[tag] = val);
    };
    return (tag: string, tag2?: string) => {
      return tag in memo ? memo[tag] : get2(tag, tag2);
    };
  }

  const itemsMemo = memos((tag) => get(Items, tag));

  const formAndItems = {
    ...Form,
    ...Object.keys(Items)
      .filter((k) => !(k in Form))
      .reduce(
        (prev, key) =>
          (prev[key] = Items[key as keyof typeof Items] || 1) && prev,
        {} as any,
      ),
    F,
    Icon,
  };

  const formItems = Object.values(Form)

  const formMemo = memos((tag) => get(formAndItems, tag));
  const FormCPS = Object.values(Form);
  const noWraps = [Items.Tr, F, Items.Icon];

  registerBlockHandlers<SchemaBlock>("form", {
    id: "form",
    scope: "form",
    init: (block) => {
      block.tag ??= formMemo(block.type!, block.sType);
    },

    wrap: (block) => {
      if (
        block.tag &&
        !formItems.includes(block.tag as any) &&
        !noWraps.includes(block.tag as any) &&
        isStatefulBlock(block as WidgetBlock) &&
        !getMeta(block.tag)?.raw
      ) {
        return {
          tag: Form.Wrapper,
          items: block as WidgetBlock,
          handler: "form",
          schema: block.schema,
          type: block.type,
          sType: block.sType,
          $$warped: true,
          $rend: React.createElement(Form.Wrapper, { block } as any),
        };
      }
      return block;
    },

    render: function (block, { props, ref, params }) {
      const CP = block.tag;
      const meta = isReactType(CP) ? getMeta(CP) : undefined;
      if (meta && !meta.raw) {
        //console.log("FormHandler render wrapBlock:", block)
        return wrapBlock(
          block,
          CP as React.ElementType,
          props,
          ref,
          meta as BlockMeta,
        );
      }

      return params.render(props());
    },
    canRender: function (block: Partial<SchemaBlock>, s: Schema): boolean {
      const CP = formMemo(block.type!, block.sType);
      return Boolean(CP);
    },
    doScope: function (props, parent) {
      return { ...props, C: formAndItems } as any;
    },
    scopeContext: () => ({ C: formAndItems }),
  });

  
  const ListAndItems = {
    ...List,
    ...Object.keys(Items)
      .filter((k) => !(k in List))
      .reduce(
        (prev, key) =>
          (prev[key] = Items[key as keyof typeof Items] || 1) && prev,
        {} as any,
      ),
    F,
    Icon,
  };

  const listItems = Object.values(List)

  const listMemo = memos((tag) => get(ListAndItems, tag));

  registerBlockHandlers<SchemaBlock>("list", {
    id: "list",
    scope: "list",
    init: (block) => {
      block.tag ??= listMemo(block.type!, block.sType);
    },
    wrap: (block) => {
      if (
        block.tag &&
        !listItems.includes(block.tag as any) &&
        !noWraps.includes(block.tag as any) &&
        isStatefulBlock(block as WidgetBlock) &&
        !getMeta(block.tag)?.raw
      ) {
        return {
          tag: List.Wrapper,
          items: block as WidgetBlock,
          handler: "list",
          schema: block.schema,
          type: block.type,
          sType: block.sType,
          $$warped: true,
        };
      }
      return block;
    },
    render: function (block, { props, ref, params }) {
      const CP = block.tag;
      if (CP === List.list) {
        //console.log("Try set list props: ", props())
      }
      const meta = isReactType(CP) ? getMeta(CP) : undefined;
      if (meta && !meta.raw) {
        return wrapBlock(
          block,
          CP as React.ElementType,
          props,
          ref,
          meta as BlockMeta,
        );
      }

      return params.render(props());
    },
    canRender: function (block: Partial<SchemaBlock>, s: Schema): boolean {
      const CP = listMemo(block.type!, block.sType);
      return Boolean(CP);
    },
    doScope: function (props, parent) {
      return { ...props, C: ListAndItems } as any;
    },
    scopeContext: () => ({ C: Items }),
  });

  registerBlockHandlers<SchemaBlock>("filter-form", (get) => {
    const FormHandler = get("form")!
      .constructor as typeof BaseBlockHandler<SchemaBlock>;

    class F extends FormHandler {
      init(block: any, s: Schema) {
        if (block.tag) return;
        if (block.sType === "form") {
          block.tag = FilterForm.Form;
        } else {
          super.init(block, s);
        }
      }
    }

    return new F() as BlockHandler;
  });
}
