import { useViewBlockContext, BlockContext } from "~/context";
import { registerBlockHandlers } from "./block-handler";
import { Form } from "./components/form-view";
import { List } from "./components/list-view";
import { Field as CBField } from "./widgets";
import {
  type FieldBlock,
  type ResourceView,
  type Schema,
  type SchemaBlock,
  type SxProps,
  type Widget,
  type WidgetBlock
} from "~/utils";
import { useRenderBlock } from "./block";
import { Items } from "../other/items";

function ViewComponent({ ctx }: { ctx: object }) {
  const block = useViewBlockContext();
  //const handler = getHandlerRender(block);
  //const { tab } = useResourceContext();
  const render = useRenderBlock();

  return render(block, ctx);
}

function BlockWrap({
  CP,
  block,
  props,
}: {
  block: SchemaBlock;
  CP: React.ComponentType<any>;
  props: (block?: SchemaBlock) => SxProps;
}) {
  if (typeof CP === "function" && "$block" in CP) {
    const type = CP["$block"];
    if (type === "props") return <CP {...props()} block={block} />;

    return (
      <BlockContext.Provider value={block as WidgetBlock<Widget>}>
        <CP {...props()} />
      </BlockContext.Provider>
    );
  }

  return <CP {...props()} />;
}

registerBlockHandlers<SchemaBlock>("form", {
  id: "form",
  scope: "form",
  init: (block) => {
    if (block.sType === "form") {
      block.Comp = ViewComponent;
    }
  },
  map: function (
    s: Schema,
    scope: { root?: ResourceView; scope: string; ctx: any },
  ) {
    return undefined;
  },
  render: function ({
    block,
    props,
    render,
  }: {
    block: SchemaBlock;
    ctx: any;
    props: (block?: SchemaBlock) => SxProps;
    render: (block: SchemaBlock) => React.ReactNode;
  }) {
    switch (block.sType) {
      case "form":
        return <Form.Form {...props(block)} />;
      case "field":
        return <Form.Field {...props(block)} field={block as FieldBlock} />;
      case "panel":
        return <Form.Panel {...props(block)} item={block} />;
    }
    const CP = ListAndItems[block.type!] ?? ListAndItems[block.sType!];
    if (CP) return <BlockWrap block={block} CP={CP} props={props} />;
    return render(block);
  },
  canRender: function (block: Partial<SchemaBlock>, s: Schema): boolean {
    return block.type! in Form || block.type! in Items;
  },
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
};
registerBlockHandlers<SchemaBlock>("list", {
  id: "list",
  scope: "list",
  init: (block) => {
    if (block.sType === "list") {
      block.Comp = ViewComponent;
    }
  },
  map: function (
    s: Schema,
    scope: { root?: ResourceView; scope: string; ctx: any },
  ) {
    return undefined;
  },
  render: function ({
    block,
    props,
    render,
  }: {
    block: SchemaBlock;
    ctx: any;
    props: (block?: SchemaBlock) => SxProps;
    render: (block: SchemaBlock) => React.ReactNode;
  }) {
    if (block.type === "List") return <List.Root {...props(block)} />;
    if (block.type === "Field") return <CBField field={block as FieldBlock} />;

    const CP = ListAndItems[block.type!] ?? ListAndItems[block.sType!];
    if (CP) return <BlockWrap block={block} CP={CP} props={props} />;
    return render(block);
  },
  canRender: function (block: Partial<SchemaBlock>, s: Schema): boolean {
    return block.type
      ? block.type in ListAndItems
      : block.sType
        ? block.sType in ListAndItems
        : false;
  },
  doScope: function (props, parent) {
    return { ...props, Comps: ListAndItems } as any;
  },
});
