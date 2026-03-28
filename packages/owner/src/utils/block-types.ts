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
  isPlainObject,
  type BaseFormView,
  type DataContext,
  type Field,
  type FilterFormView,
  type FilterView,
  type FormView,
  type ListView,
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
  | "other"
  | "h";

export interface BlockRawType {}

export type SxProps = SxComponentProps & {
  [key: string]: any;
};

export type Props = SxProps 

export interface BlockRenderProps {
  ctx?: any;
  ref?: any;
  props: any;
}

export type RenderParams<S extends Block = any> = {
  //factory: typeof React.createElement;
  ctx: object;
  render: (props: Props) => React.ReactNode;
}

type RenderOptions<S extends Block = any> = {
  //block: S;
  params: RenderParams<S>;
  props: () => SxProps;
  ref?: any;
};


export enum EvalFlags {
  PROPS = 1,
  SLOTS = 2,
  CHILD = 4,
  DON_PROPS = 16,
  DONE_SLOTS = 32,
  DONE_CHILD = 64,
  PROPS_FN = 128,
}

export interface Block {
  tag?: React.ElementType | BlockTypes | undefined;
  props?: Props;
  items?: Block | Block[];
  type?: string;
  slots?: Record<string, Block>;
  handler?: string;
  render?: React.FunctionComponent<BlockRenderProps>;
  dynamic?: boolean;
  $rend?: React.ReactNode;
  $props?: any;
  flags?: number;

}

export type ReactFactory = {
  create: typeof React.createElement;
};

export type EvalProps = (block: Block, ctx: any) => SxProps;


export interface OtherBlock extends Block {
  tag: "other" | React.ElementType;
}

export interface HBlock extends Block {
  tag: "h" | React.ElementType;
  content: ((ctx:object) => React.ReactNode);
}

export interface HtmlBlock extends Block {
  tag: "div" | "span" | React.ElementType;
  type: 'html'
  content: ((ctx:object) => React.ReactNode);
}

export interface SchemaBlock<S extends Schema = Schema> extends OtherBlock {
  schema: S;
  sType: S["type"];
  level?: number;
  name?: string;
  title?: string;
  help?: string;
  widget?: string;
}

export interface WidgetBlock<S extends Widget = Widget> extends SchemaBlock<S> {
  schema: S;
  hidden?: boolean;
  hideIf?: (ctx: object) => boolean;
  readonly?: boolean;
  readonlyIf?: (ctx: object) => boolean;
  onClick?: (ctx: object) => void;
  evalProps?:(ctx: object) => any;
  

  uid: string;
}

export interface FieldBlock extends Omit<WidgetBlock<Field>, 'sType'> {
  sType: Field["pType"];
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
  open?: boolean;
}

export type BaeFormViewBlock<R extends BaseFormView = BaseFormView> = ViewBlock<R> & {
   onSubmit?: (context: DataContext) => Promise<any>;
   validate?: (context: DataContext) => Promise<any>;
   readonly?: boolean;
   editable?: boolean;
}

export type FormViewBlock = BaeFormViewBlock<FormView> & {
  readonly?: boolean;
  editable?: boolean;
  delete?: boolean;
  create?: boolean;
  readonlyIf?: boolean | ((context: DataContext) => boolean);
  onEdit?: (context: DataContext) => Promise<any>;
  onDelete?: (context: DataContext) => Promise<any>;
  onNew?: (context: DataContext) => Promise<any>;
};

export type FilterViewBlock = ViewBlock<FilterView> & {
  form?: BaeFormViewBlock<FilterFormView>;
}


export type ListViewBlock = BaeFormViewBlock<ListView> & {
  test?: string;
};
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

export function isSchemaBlock(block: Block): block is SchemaBlock {
  return isPlainObject(block) && 'schema' in block
}

export function isStatefulBlock(block: WidgetBlock) {
  return isFieldBlock(block) ||
      block.hideIf ||
      block.readonlyIf ||
      block.evalProps ||
      block.onClick ||
      !!block.schema.depends
}


type BlockScope = {
  root?: ResourceView;
  scope: string;
  ctx: any;
};



export type BlockHandler<S extends Block = any> = {
  id: string;
  scope: string;
  map?: (s: Schema, scope: BlockScope) => S | undefined;
  init?: (block: Partial<S>, s: Schema) => void;
  
  render: (block: S, options: RenderOptions<S>) => React.ReactNode;
  canRender: (block: Partial<S>, s: Schema) => boolean;
  
  end?: (block: S) => void;
  doScope?: <Props extends BlockRenderProps & Record<string, any>>(
    props: BlockRenderProps,
    parent?: BlockHandler<S>,
  ) => Props;
  scopeContext?: (parentCtx?: object) => any;
  wrap?: (block: Partial<S>, s: Schema) => void;
};


export interface BlockHandlerType<S extends Block = any> {
  new(id:string, scope:string): BlockHandler<S>
}