import type {
  Block,
  Container,
  DataContext,
  DataRecord,
  DataStore,
  DeepPath,
  FieldBlock,
  FieldErrors,
  FilterFormView,
  FilterViewBlock,
  FormView,
  FormViewBlock,
  ListViewBlock,
  OutletRoute,
  Property,
  Resource,
  ResourceView,
  SavedFilter,
  SearchOptions,
  SearchPage,
  SearchResult,
  ViewBlock,
  WidgetBlock,
} from "~/utils";
import type { SetStateAction } from "react";
import type { SxComponentProps } from "@funext/ui";

import type { Identifier } from "~/utils";
import type { ActionExecuter } from "./action";
import type { FilterTabs, FilterWidget } from "~/utils/filter";

export type FilterParams = {
  openedGroups: string[];
  filter?: Record<string, any>;
  search?: string;
};

export type ListParams = FilterParams & {
  sort?: string | null | undefined;
  selectedIds?: Identifier | null | undefined;
  page: number;
  pageSize: number;
  total: number;
  offset: number;
  pages: number;
};

export type PageInfo = {
    total: number;
    page: number;
    pages: number;
    offset: number;
  }

export interface ListModifiers {
  changeParams: (action: any) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort?: string | null) => void;
  setFilters: (filters?: any) => void;
  updateFilters: (filters: any, debounce?: boolean) => void;
  setSearch: (s?: string | null) => void;
  toggleGroup: (name: string) => void;
  setSelectionIds: (selectedIds?: any[] | null) => void;
  setPageInfo: (info: PageInfo) => void;
}


export type ResourceContext = {
  tab: Tab;
  dataStore: DataStore;
  //setSearch:
  doSearch: (option?: SearchOptions) => Promise<SearchResult>;
  query?: ListParams;
  modifiers?: ListModifiers;
};


/**
 * The route state of a specific view type.
 *
 */
export type TabRoute = {
  action: string;
  mode?: string;
  id?: string;
  qs?: Record<string, string>;
  view?: string;
  replace?: boolean;
};

/**
 * Additional state of a specific view type.
 *
 */
export type TabProps = {
  scrollY?: number;
  scrollX?: number;
  selectedCell?: null | number[];
  selectedRows?: null | number[];
  selectedId?: number;
  name?: string;
  readonly?: boolean;
  recordId?: boolean;
  showSingle?: boolean;
  dataStore?: DataStore;
  listParams?: ListParams;
  actions?: {
    state: any;
    binding?():any;
    saveState?(props: TabProps):void;
    restoreState?(props: TabProps):void;
    search?(option?: SearchOptions): Promise<SearchResult>;
  }
};

/**
 * The TabState represents volatile state of a tab.
 *
 */
export type TabState = {
  /**
   * The tab title
   *
   */
  title: string;

  /**
   * The current view form mode
   *
   */
  mode?: "show" | "new" | "edit" | undefined;

  /**
   * The current view type
   *
   */
  type: string;

  /**
   * The current view name
   *
   */
  name?: string;

  /**
   * Previous view type.
   *
   */
  prevType?: string;

  /**
   * Previous mode type.
   *
   */
  prevMode?: string;

  /**
   * Whether the tab is dirty
   *
   * Can be used to show confirmation dialog before closing the tab.
   */
  dirty?: boolean;

  /**
   * Keeps track of filters per tab.
   *
   */
  filters?: SavedFilter[];

  /**
   * Keeps track of route options per view type.
   *
   */
  routes?: Record<string, TabRoute>;

  /**
   * Keep track of additional state per view type.
   *
   */
  props?: Record<string, TabProps>;

  visible?: boolean;

  view: ResourceView;
  block: ViewBlock;
};

export type TabListener = (state: TabState) => void;

/**
 * A tab represents an action-view visible as a tab or popup view.
 *
 */
export type Tab = {
  /**
   * Unique id of the tab, usually the name of the action-view.
   *
   * If id starts with `$`, browser route won't be handled for that tab.
   */
  readonly id: string;

  /**
   * The initial display title.
   *
   * The actual title is displayed from the `state`.
   */
  readonly title: string;

  /**
   * The action-view of this tab.
   *
   */
  readonly action: Resource;

  /**
   * Whether this tab is a popup view.
   *
   */
  readonly popup?: boolean;

  /**
   * Whether this tab is a dashlet view.
   *
   */
  readonly dashlet?: boolean;

  readonly locationSync?: boolean;

    /**
   * The volatile state of the tab
   *
   */
  readonly state: TabState;
  readonly filter?: FilterViewBlock;

  getState(): TabState;

  subscribe(listener: TabListener): () => void;

  custom?: OutletRoute;

  goPrev?(): void;

  /**
   * Options for the popup views.
   *
   */
  readonly popupOptions?: {
    /**
     * Whether the popup should be displayed in fullscreen mode.
     *
     */
    fullScreen?: boolean;

    /**
     * Whether to show the toolbar.
     *
     */
    showToolbar?: boolean;

    /**
     * Whether to show the edit icon in grid popup.
     *
     */
    showEditIcon?: boolean;

    /**
     * Whether to allow multiple row selection in grid popup.
     *
     */
    multiSelect?: boolean;

    side?: "popup" | "drawer" | "sheet" | undefined;

    /**
     * The method called after grid search request
     */
    onGridSearch?: (
      records: DataRecord[],
      page: SearchPage,
      search?: Record<string, string>,
    ) => DataRecord[];
  };


};

export type TabOptions = {
  type?: string;
  mode?: string;
  route?: Omit<TabRoute, "action">;
  props?: Record<string, any>;
  params?: Record<string, any>;
  custom?: OutletRoute;
  context?: any;
  tab?: boolean;
  force?: boolean;
  onGridSearch?: (
    records: DataRecord[],
    page: SearchPage,
    search?: Record<string, string>,
  ) => DataRecord[];
};

/**
 * Open the given view with the optional view route and props.
 *
 * @param view the action-view or name
 * @param options the options for the view type
 * @returns a Tab or null if no tab was opened (due to non-existence of the action-view)
 */
export type OpenTab = (
  view: Resource | string,
  options?: TabOptions,
) => Promise<Tab | null>;

/**
 * Close the given view.
 *
 * @param view the action-view or name
 * @param type the initial view type
 */
export type CloseTab = (view: Resource | string) => void;

export type PartTabState = Omit<
  TabState,
  | "name"
  | "title"
  | "type"
  | "mode"
  | "prevType"
  | "prevMode"
  | "view"
  | "block"
  | "props"
  | "route"
> & {
  name?: string;
  title?: string;
  /**
   * Keeps track of route options per view type.
   *
   */
  route?: Partial<TabRoute>;

  /**
   * Keep track of additional state per view type.
   *
   */
  props?: Partial<TabProps>;

  type?: string;
};

/*
export type PartialTabState = Omit<TabState, 'name' | 'title' | 'type' | 'mode' | 'prevType' | 'prevMode' | 'view' | 'block' | 'props' | 'route'> & {
  name?: string;
  title?: string;
  route?: TabRoute;

}*/

export interface ViewStore {
  readonly pages: Tab[];
  readonly popups: Tab[];
  setState(tabId: string, state: SetStateAction<Partial<TabState>>): void;
  updateState(tabId: string, state: PartTabState, type?: string): void;
  setTabProps(tabId: string, props: TabProps, type?: string): void;
  find(tabId: string): Tab | undefined;
  get active(): string;
  openTab: OpenTab;
  closeTab: CloseTab;
  readonly current?: Tab;
  //setTabState()
}

export interface WidgetBlockProps extends SxComponentProps {
  block: WidgetBlock;
}

export interface FieldBlockProps extends SxComponentProps {
  field: FieldBlock;
}

export interface WidgetBlockPropsWithRef extends WidgetBlockProps {
  ref?: React.Ref<React.ElementType>;
}

export type IndexRecord = DataRecord | number;

export type Ref<T> = {
  readonly current: T;
};

export type IWState = {
  readonly uid: string;
  readonly hidden?: boolean;
  readonly disabled?: boolean;
  readonly props?: Record<string, any>;
  readonly readonly?: boolean;
};


export type IFState = IWState &{
  
  readonly focused?: boolean;
  readonly touched?: boolean;
  readonly required?: boolean;
  readonly dirty?: boolean;
  readonly error?: FieldErrors;
  readonly valid?: boolean;
  readonly filled?: boolean;
};

export interface BasicWidgetState<IState extends IWState = IWState> {
  subscribe(callback: () => void): () => void;
  snapshot(): IState;
  get state(): IState;
  setState<K extends keyof IState>(key: K, value?: IState[K], trigger?: boolean): void;
  emit(): void;
  readonly parent?: BasicWidgetState;
}

export interface IWidgetState<IState extends IWState = IWState> extends BasicWidgetState<IState> {

  trigger(ctx: object): void;

  unregister(): void;
  get name(): string | undefined;

  get block(): WidgetBlock;

  get isField(): boolean;

  close(): void;

  get context(): DataContext;
}

export interface IIWidgetState extends Omit<IWidgetState, "isField"> {
  get isField(): false;
}

export interface IFieldState
  extends Omit<IWidgetState<IFState>, "block" | "isField" | "name"> {
  get isField(): true;
  get block(): FieldBlock;
  get name(): string;
  get readOnly(): boolean;
  get(defaults?: any): any | null | undefined;
  get value(): any | null | undefined;
  set(value?: any, trigger?: boolean, markDirty?: boolean): void;
  
  //compute(ctx: object): Promise<ComputeResult | undefined> | undefined;

}



export type IRecordStore = {
  subscribe: (callback: (data?: Partial<DataRecord>) => void) => () => void;
  snapshot: () => DataRecord;
  get rec(): DataRecord;
  set(data: Partial<DataRecord>, trigger?: boolean, force?: boolean): void;
  get(path: DeepPath, defaultValue?: any): any | undefined;
  emit: () => void;
  close(): void;
};

export type FormState = IWState & {
  readonly status?: "loading" | "error" | "submit" | "validate";
  readonly error?: any;
  readonly editing?: boolean;
  readonly dirty: boolean;
  readonly valid: boolean;
  readonly change: number;
  readonly prev: number;
};

export type IValidator = () => FieldErrors[] | null;
export type ICommitter = () => void;


export interface IFormContext extends BasicWidgetState<FormState>{
  register<W extends WidgetBlock>(widget: W, parent?: BasicWidgetState): IWidgetState;
  widget(str: string): IWidgetState | undefined;
  field(str: string): IFieldState | undefined;
  reset(data?: DataRecord): void;
  close(): void;
  onRecord: (callback: (data?: Partial<DataRecord>) => void) => () => void;
  submit(): Promise<any>;
  validate(): Promise<any>;
  commit(): Promise<any>;
  refresh(): void;
  addCommitter: (fn: ICommitter) => () => void;
  addValidator: (fn: IValidator) => () => void;

  readonly store: IRecordStore;
  readonly isNew: boolean;
  readonly view: FormViewBlock;
  readonly record: DataRecord;
  readonly id?: Identifier | null;
  readonly context: Readonly<DataContext>;
  readonly executer: Readonly<ActionExecuter>;
  readonly states: Readonly<Map<string, IWidgetState>>;
  readonly fields: Readonly<Map<string, IFieldState>>; 
  readonly parentForm?: IFormContext;
}

export interface EditableFormState extends IFormContext {
  readonly id?: DataRecord['id'];
  addCommitter: (fn: ICommitter) => () => void;
  addValidator: (fn: IValidator) => () => void;
  render(block: Block, ref?: any): React.ReactNode;
};

export interface BlockMeta {
  wrap?: 'prop' | 'context' | React.ComponentType<{block: Block} & Record<string, any>>;
  props?: (block: Block, props: any) => any;
  noProps?: boolean;
  getFlags?: (block: Block) => number;
  raw?: boolean;
}

export interface ComponentMeta<P extends any=any> extends React.FunctionComponent<P> {
    //new(props: P, context?: any): Component<P, S>;
  $meta: BlockMeta;
}


export interface MetaData {
  model: string;
  fields: Property[]; // incoming is array, processed to object;
  //jsonFields?: Record<string, Record<string, JsonField>>;
 //perms?: Perms;
}

export interface ViewData<T> extends Partial<MetaData> {
  view: T;
  //helps?: Record<string, Record<string, HelpOverride>>;
  //related?: Record<string, string[]>; // additional fields after view processing
}

type ActionRef = {
  readonly context?: DataContext;
  readonly evalContext?: DataContext;
  readonly fields?: Property[];
  search?(option?: SearchOptions): Promise<SearchResult>;
};

type SaveState = (props: TabProps, save?: boolean) => void;

type ViewExtProps = {
  dataStore: DataStore;
  evalContext: DataContext;
  context?: DataContext;
  
  setProps(props: TabProps):void;
  getProps():TabProps; 
  addSaveState(saveState:SaveState): ()=> void;
  bind(ref: ActionRef): void;
}

type ViewListExtProps = ViewExtProps &{
  search?(option?: SearchOptions): Promise<SearchResult>;
  query?: ListParams;
  modifiers?: ListModifiers;
  filterTabs?: FilterTabs;
  filterSidebar?: Container<FilterWidget>;
  filterForm?: FormView;
  sideOpen?: boolean;
  formOpen?: boolean;
  setSideOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  filterDefaults?: any;
}

export type ViewProps<T extends ViewBlock> = T extends
  | ListViewBlock ? ViewListExtProps & ViewData<T> : T extends 
  | FormViewBlock ? ViewExtProps & ViewData<T> 
  : ViewData<T>;


type BindActionRef = {
  readonly context?: DataContext;
  readonly evalContext?: DataContext;
  readonly fields?: Property[];
};

export type BindableViewContext = {
    bind: (ref: BindActionRef) => void;
}
//export function meta<P extends any=any>(comp: React.FunctionComponent<P>, meta: BlockMeta):ComponentMeta<P>;