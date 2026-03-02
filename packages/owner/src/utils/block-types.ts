import type {
  FlexProps,
  CardProps,
  SxComponentProps,
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
} from "@funext/ui";
import { noop } from "lodash";
import * as React from "react";
import {
  EMPTY_RECORD,
  isField,
  type DataContext,
  type Field,
  type FilterView,
  type FormView,
  type ResourceView,
  type Schema,
  type Widget,
} from "~/utils";
import { evalExpr } from "~/utils/eval-context";

export interface BlockProps extends SxComponentProps, FlexProps {
  label: React.ReactNode;
}

export interface LayoutProps extends SxComponentProps {}

export interface BlockCardProps extends CardProps {
  header?: CardHeaderProps;
  expandable?: boolean;
  open?: boolean;
}

export interface BlockBodyProps extends CardBodyProps {}

export interface BlockFooterProps extends CardFooterProps {}

export interface CustomBlockProps {}

export type BlockTypes =
  | "block"
  | "other"
  | "text"
  | "layout"
  | "grid"
  | "item"
  | "panel"
  | "card"
  | "body"
  | "header"
  | "footer"
  | "custom";

export interface BlockRawType {}

export type SxProps = SxComponentProps & {
  [key: string]: any;
};

export type Props = SxProps | ((ctx: any) => SxProps);

export interface BlockRenderProps {
  ctx: any;
  block: Block;
  render: (
    block: Block,
    options?: { ctx?: object; evalSlots?: boolean },
  ) => React.ReactNode;
  props: (options?: {
    ctx?: object;
    block?: Block;
    evalSlots?: boolean;
  }) => any;
}

export interface Block {
  tag?: React.ElementType | React.ComponentType | BlockTypes | undefined;
  props?: Props;
  items?: Block | Block[];
  type?: string;
  slots?: Record<string, Block>;
  handler?: string;
  render?: React.FunctionComponent<BlockRenderProps>;
  $key?: any;
}

export type ReactFactory = {
  create: typeof React.createElement;
};

export type EvalProps = (block: Block, ctx: any) => SxProps;

type CustomBlockComponentProps = {
  blocK: CustomBlock;
  ctx: object;
  factory: ReactFactory;
  evalProps: EvalProps;
};

export interface ExtendedBlock {
  context: "create";
}
export interface CustomBlock extends Block {
  tag: "custom";
  component:
    | React.ReactElement<CustomBlockComponentProps>
    | React.FunctionComponent<CustomBlockComponentProps>;
}

export interface OtherBlock extends Block {
  tag: "other";
}

export interface SchemaBlock<S extends Schema = Schema> extends OtherBlock {
  schema: S;
  sType: S["type"];

  Comp?: React.ComponentType<{ ctx: object }>;
}

export interface WidgetBlock<S extends Widget = Widget> extends SchemaBlock<S> {
  schema: S;
  hidden?: boolean;
  hideIf?: (ctx: object) => boolean;
  readonly?: boolean;
  readonlyIf?: (ctx: object) => boolean;
  onClick?: (ctx: object) => void;
  uid: string;
}

export interface FieldBlock extends WidgetBlock<Field> {
  required?: boolean;
  requiredIf?: (ctx: object) => boolean;
  compute?: (ctx: object) => any;
  canSelect?: (ctx: object) => boolean | undefined;
  onChange?: (ctx: object) => any;
  onSelect?: (ctx: object) => Field["options"] | undefined;
  validate?: (context: DataContext) => Promise<any>;
  validIf?: (context: DataContext) => Promise<any>;
}

export interface ViewBlock<R extends ResourceView = ResourceView>
  extends SchemaBlock<R> {
  type: `view-${R["type"]}`;
}

export type FormViewBlock = ViewBlock<FormView> & {
  readonly?: boolean;
  editable?: boolean;
  delete?: boolean;
  create?: boolean;
  readonlyIf?: boolean | ((context: DataContext) => boolean);
  onSubmit?: (context: DataContext) => Promise<any>;
  onEdit?: (context: DataContext) => Promise<any>;
  onDelete?: (context: DataContext) => Promise<any>;
  onNew?: (context: DataContext) => Promise<any>;
  validate?: (context: DataContext) => Promise<any>;
};

export type FilterViewBlock = ViewBlock<FilterView>;

//FilterView

export function rawProps(props: Props, ctx?: any): SxProps {
  if (!props) return null;

  if (typeof props === "function") {
    return props(ctx);
  }

  if (typeof props === "string") {
    return evalExpr(props)(ctx ?? EMPTY_RECORD) as SxProps;
  }

  return props as SxProps;
}

export function isFieldBlock(block: SchemaBlock): block is FieldBlock {
  return isField(block.schema);
}

type BlockScope = {
  root?: ResourceView;
  scope: string;
  ctx: any;
};

type RenderOptions<S extends Block = any> = {
  block: S;
  ctx: any;
  props: (block?: S) => SxProps;
  render: (block: S) => React.ReactNode;
};

export type BlockHandler<S extends Block = any> = {
  id: string;
  scope: string;
  map?: (s: Schema, scope: BlockScope) => S | undefined;
  render: (options: RenderOptions<S>) => React.ReactNode;
  canRender: (block: Partial<S>, s: Schema) => boolean;
  init?: (block: Partial<S>, s: Schema) => void;
  doScope?: <Props extends BlockRenderProps & Record<string, any>>(
    props: BlockRenderProps,
    parent?: BlockHandler<S>,
  ) => Props;
};
