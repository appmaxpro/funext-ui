import type {
  DataRecord,
  DataStore,
  FieldBlock,
  FilterViewBlock,
  Resource,
  ResourceView,
  SavedFilter,
  SearchPage,
  ViewBlock,
  WidgetBlock,
} from "~/utils";
import type { ListParams } from "./list-types";
import type { SetStateAction } from "react";
import type { SxComponentProps } from "@funext/ui/src";

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
  listState?: ListParams;
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

  /**
   * The volatile state of the tab
   *
   */
  readonly state: TabState;
  readonly filter?: FilterViewBlock;

  subscribe(listener: TabListener): () => void;
};

type TabOptions = {
  type?: string;
  route?: Omit<TabRoute, "action">;
  props?: Record<string, any>;
  params?: Record<string, any>;
  context?: any;
  mode?: string;
  tab?: boolean;
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
  update(tabId: string, state: SetStateAction<Partial<TabState>>): void;
  setState(tabId: string, state: PartTabState, type?: string): void;
  setTabProps(tabId: string, props: TabState["props"]): void;
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

export type IndexRecord = DataRecord | number