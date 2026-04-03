import type { ManipulateType } from "dayjs";
import type React from "react";
import { EMPTY_ARRAY } from "./constant";

export type Identifier = number | string;


interface BlockRenderProps {
  ctx?: any;
  ref?: any;
  props: any;
}
export type ErrorReport = {
  title?: string;
  message?: string;
  causeClass?: string;
  causeMessage?: string;
  causeStack?: string;
  entityId?: number;
  entityName?: string;
  constraints?: Record<string, string>;
};

export type DataRecord = {
  id?: Identifier | null;
  version?: number | null;
  $version?: number | null;
  selected?: boolean;
  [k: string]: any;
};

export type DataContext = DataRecord & {
  _ids?: Identifier[];
  _model?: string;
  _parent?: DataContext;
  _signal?: string;
  _record?: DataRecord;
};

export type FilterOp =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "in"
  | "not in"
  | "like"
  | "ilike"
  | "not like";

export type Domain = [fieldName:string, operator:FilterOp, value:any]
type DomainTs = Domain[] | [operator: "&" | "|",  domains: Domain[]]
export type Domains = DomainTs | [operator: "&" | "|",  domains: DomainTs]

export type DomainsGet = Domains | ((ctx: any) => Domains);


export type PropertyType =
  | "string"
  | "text"
  | "boolean"
  | "int"
  | "float"
  | "decimal"
  | "date"
  | "datetime"
  | "binary"
  | "select"
  | "mto" //many_to_one
  | "otm" //one_to_many
  | "mtm"; //many_to_many

export type DirectionType = "horizontal" | "vertical";

export interface Option {
  value?: string;
  title?: string;
  help?: string;
  icon?: string;
  color?: string;
  order?: number;
  hidden?: boolean;
  data?: any;
}

export type SortedField = {
  name: string;
  title: string;
}

export interface BaseSchema {
  props?: Record<string, any> | string;
}

export interface Schema extends BaseSchema{
  uid?: string;
  type: string;
  tag?: any;
  name?: string;
  title?: string;
  help?: string;
  handler?: string;
  props?: Record<string, any> | ((ctx: any) => Record<string, any>);
  if?: string;
}

export interface Property {
  pType: PropertyType;
  name: string;
  placeholder?: string;
  canSuggest?: boolean;
  canSelect?: string;
  onChange?: string;
  onSelect?: string;
  target?: string;
  targetName?: string;
  targetSearch?: string[];
  aggregate?: string;
  sortable?: boolean;
  orderBy?: string;
  moveBy?: string;
  limit?: number;
  optionsIn?: string;
  options?: Option[];
  multiple?: boolean;
  domain?: DomainsGet;
  filterDomain?: DomainsGet;
  context?: Record<string, any>;
  required?: boolean;
  requiredIf?: string;
  validIf?: string;
  validate?: string;

  canDirty?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  pattern?: string;
  scale?: number;
  parse?: (value:any, ctx: object)=> any;
  format?: (value:any, ctx: object)=> string|null;

}

export interface WidgetRenderer {
  ctx: any;
  block?: any;
  evalProps?: (block: any) => any;
}

export interface Widget extends Omit<Schema, 'props'>{
  hidden?: boolean;
  hideIf?: string;
  readonly?: boolean;
  readonlyIf?: string;
  depends?: string;
  widget?: string;
  slots?: Record<string, Widget> | ((ctx: any) => Record<string, Widget>);
  props?: Record<string, any>;
  cProps?: (ctx: any) => Record<string, any>;
  render?: React.FunctionComponent<BlockRenderProps> ;
  items?: Widget[];
  context?: DataContext;
}

export interface Field extends Omit<Property & Widget, 'type'> {
  type: "field";
  name: string;
  noTitle?: boolean;
}

export interface WidgetOptions extends Widget{
  
}

export interface Container<W extends Widget|Container|Field = Widget> extends Widget {
  items: W[];
}

export interface LayoutWidget extends Container {
  type: "flex" | "grid";
}


export interface ResourceMeta {
  fields: Property[];
  get: (name: string) => Property | undefined;
  readonly views: ResourceView[];
}

export interface ResourceView extends Omit<Schema, 'name'>  {
  name: string;
  items: Widget[];
  model?: string;
}

export interface BaseFormView extends ResourceView {
  side?: 'left' | 'bottom' | 'popover';
  onSubmit?: (context: DataContext) => Promise<any>;
  validate?: (context: DataContext) => Promise<any>;
}

export interface FormView extends BaseFormView {
  type: "form";
  mode?: 'edit' | 'show';
  readonly?: boolean;
  edit?: boolean;
  delete?: boolean;
  create?: boolean;
  readonlyIf?: ((context: DataContext) => boolean);
  onEdit?: (context: DataContext) => Promise<any>;
  onDelete?: (context: DataContext) => Promise<any>;
  onNew?: (context: DataContext) => Promise<any>;  
}

export interface ListView extends ResourceView {
  type: "list";
}


export interface CustomView extends ResourceView {
  type: "custom";
}

export interface FilterFormView extends BaseFormView {
   type: "filter-form";
}

export interface FilterView extends ResourceView {
  type: "filter";
  form?: FilterFormView;
  sidebar?: Container;
  defaults?: Record<string, any>;
}

export interface ResourceContext extends DataContext {
  processWidget: (schema: Partial<Widget>) => Widget;
  get: ResourceMeta['get'];
};

export interface Resource extends Omit<Schema, 'name'>, ResourceMeta{
  readonly type: "resource";
  readonly name: string;
  readonly model?: string;
  
  readonly filter?: FilterView;
  readonly params?: Record<string, any>;
  
  viewType?: string;
  readonly sorted?: SortedField[];
  readonly evalContext: ResourceContext;
  readonly context: DataContext;
  readonly domain?: Domains;
}

export interface RelationField extends Field {
  pType: "mto" | "otm" | "mtm";
  //views?: ResourceView[];
}

export interface ManyField extends RelationField {
  pType: "mto" | "mtm";
}

export interface OtmField extends RelationField {
  pType: "otm";
}

export interface DynamicField extends RelationField, ResourceMeta {
  pType: "mto" | "otm" | "mtm";
}

export interface DynamicManyField extends DynamicField {
  pType: "mto" | "mtm";
}

export interface DynamicOtmField extends DynamicField {
  pType: "otm";
}

//ResourceMeta

export interface Filter {
  operator?: FilterOp;
  fieldName?: string;
  value?: any;
  value2?: any;
  timeUnit?: ManipulateType;
}


export interface Criteria {
  operator?: "and" | "or";
  criteria?: (Filter | Criteria)[];
}

export type SearchOptions = {
  limit?: number;
  offset?: number;
  order?: string;
  fields?: string[];
  domain?: Domains;
  context?: DataContext;
  active?: boolean;
  params?: any;
  s?: string;
  silent?:boolean;
  single?: boolean;
  infinite?: boolean;
  signal?: AbortSignal;
};

export type RequestSearchOptions = {
  limit?: number;
  offset?: number;
  silent?:boolean;
  single?: boolean;
  infinite?: boolean;
  signal?: AbortSignal;
}

export type SearchPage = {
  offset?: number;
  limit?: number;
  total?: number;
  pages?: number;
  page?: number;
};

export type SearchResult = {
  page: SearchPage;
  records: DataRecord[];
};

export type SelectOptions = {
  [K: string]: boolean | SelectOptions;
};

export type ReadOptions = {
  fields?: string[];
  related?: {
    [K: string]: string[];
  };
  signal?: AbortSignal;
  [K: string]: any
};

export type SaveOptions<T extends DataRecord | DataRecord[]> = ReadOptions & {
  onError?: (error: ErrorReport) => Promise<SaveResult<T>>;
};

export type SaveResult<T extends DataRecord | DataRecord[]> =
  T extends DataRecord[] ? DataRecord[] : DataRecord;

export type DeleteOption = {
  id: Identifier;
  version: number;
};

export type ExportResult = {
  exportSize: number;
  fileName: string;
};

export interface Perms {
  read?: boolean;
  write?: boolean;
  create?: boolean;
  remove?: boolean;
  export?: boolean;
  massUpdate?: boolean;
}
export interface SearchFilter {
  name?: string;
  title?: string;
  domain?: string;
  checked?: boolean;
}

export interface SavedFilter {
  id: number;
  version?: number;
  name: string;
  title: string;
  shared: boolean;
  user?: DataRecord;
  filterView: string;
  filterCustom: string;
  filters?: string;
  checked?: boolean;
}


/*by Nabil */
export interface SearchFilterGroup extends  Omit<Widget, 'items'>{
  multiple?: boolean;
  name?: string;
  title: string;
  icon?: string;
  items?: SearchFilter[];
  value?: any;
  op?: string;
  state?: any;
}

export interface SearchFilterField extends Field {
  multiple?: boolean;
  value?: any;
  op?: string;
  state?: any;
}

export interface SelectSearchFilterField extends SearchFilterField {
  selection: string;
}

export interface NodeSearchFilterField extends SearchFilterField {
  parent: string;
  rootDomain: string;
}

export interface SearchFilterPanel extends Omit<Widget, 'items'> {
  items: Array<SearchFilterGroup|SearchFilterField>;
  openState: Record<string, boolean>;
}


export type AdvancedSearchState = {
  query?: Criteria & {
    searchText?: string;
    context?: DataContext
  };
  search?: Record<string, string>; // grid search column state
  editor?: Criteria & {
    id?: number;
    name?: string;
    title?: string;
    version?: number;
    shared?: boolean;
    selected?: boolean;
  };
  archived?: boolean;
  searchText?: string;
  searchTextLabel?: string;
  filterType?: "all" | "single";
  domains?: SearchFilter[];
  filters?: SavedFilter[];
  items?: Property[];
  fields?: Record<string, Property>;
  filterPanel?: SearchFilterPanel;
};


export type ActionOptions = {
  action: string;
  model?: string;
  context?: DataContext;
  domain?: Domains;
};

export type ActionResult = {
  pending?: string;
  exportFile?: string;
  exportToken?: string;
  signal?: string;
  signalData?: any;
  info?: {
    title?: string;
    message: string;
    confirmBtnTitle?: string;
  };
  error?: {
    title?: string;
    message: string;
    action?: string;
    confirmBtnTitle?: string;
  };
  alert?: {
    title?: string;
    message: string;
    action?: string;
    confirmBtnTitle?: string;
    cancelBtnTitle?: string;
  };
  notify?:
    | { title: string; message: string }
    | { title: string; message: string }[];
  errors?: Record<string, string>;
  values?: DataRecord;
  attrs?: Record<string, Record<string, any>>;
  reload?: boolean;
  validate?: boolean;
  close?: boolean;
  canClose?: boolean;
  save?: boolean;
  new?: boolean;
  //view?: ActionView;
  report?: {
    report?: boolean;
    reportLink?: string;
    reportFile?: string;
    reportFormat?: "pdf" | "html";
    attached?: {
      id: number;
      fileName: string;
    };
  }
};




export function isField(widget: Widget|Schema): widget is Field {
  return widget.type === "field" && !!widget.name;
}

const relTypes = ['mtm', 'otm', 'mto']
export function isRelationField(widget: Field): widget is RelationField {
  return relTypes.includes(widget.pType)
}

export function isDynamicField(widget: Field): widget is DynamicField {
  return relTypes.includes(widget.pType) && 
     'views' in widget && Array.isArray(widget.views)
}

export function isRecordProps(props: Schema["props"]): props is Record<string, any> {
  return Boolean(props && typeof props === "object" && !Array.isArray(props) );
}

export function isContainer(widget: Widget): widget is Container {
  return "items" in widget && Array.isArray(widget.items);
}

export function getWidgetItems(widget: Widget) {
  if( "items" in widget && widget.items)
     return Array.isArray(widget.items) ? widget.items : [widget.items]  ;
  return EMPTY_ARRAY as Widget[]
}

export function getWidgetProp(props: Schema["props"], key:string) {
  if(isRecordProps(props)) return (props as any)[key]
}

export function getMultiValues(value?: null | number | string) {
  return value ? String(value).split(/\s*,\s*/) : [];
}

export function joinMultiValues(values: string[]) {
  return values.join(",");
}