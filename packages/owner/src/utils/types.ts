


export type ThemeMode = 'dark' | 'light' | 'system';

export interface BasicNavItem {
  showNav?: boolean;
  childNav?: boolean;
}

export interface NavSubheaderItem extends BasicNavItem {
  kind: 'header';
  title: string;
}

export interface NavDividerItem extends BasicNavItem{
  kind: 'divider';
}


type NavActionType = 'sidebar' | 'bottomNav' | 'tabs' | 'tab'
export interface RouteAction extends BasicNavItem {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  type?: NavActionType;
}

export interface NavRoute extends RouteAction{
  kind?: 'page' | 'modal';
  segment?: string;
  pattern?: string;
  path?: string;
  children?: Navigation;
  actions?: NavActionType[];
  isolate?: boolean;
  props?: Record<string, any>;
  Component?: React.ComponentType | null;
  CP?: string;
  hasErrorBoundary?: boolean;
  parent?: NavRoute;
  id?: string;
  
}

export interface PageRoute extends NavRoute{
  kind?: 'page';
  persist?: boolean | 'parent';
}

export interface ModalRoute extends NavRoute{
  kind?: 'modal';
} 

export type OutletRoute = PageRoute | ModalRoute;

export type NavItem = OutletRoute | NavSubheaderItem | NavDividerItem;

export type Navigation = NavItem[];


export type NavigationObject = {
  navigation: Navigation;
  isRoot?: boolean;
  root?: OutletRoute;
}
export interface Breadcrumb {
  /**
   * The title of the breadcrumb segment.
   */
  title: string;
  /**
   * The path the breadcrumb links to.
   */
  path?: string;
}


export interface SidebarItemProps {
  /**
   * Navigation page item definition.
   */
  item: OutletRoute;
  /**
   * Link `href` for when the item is rendered as a link.
   * @default getItemPath(navigationContext, item)
   */
  href?: string;
  /**
   * The component used to render the item as a link.
   * @default Link
   */
  LinkComponent?: React.ElementType;
  /**
   * If `true`, expands any nested navigation in the item, otherwise collapse it.
   * @default false
   */
  expanded?: boolean;
  /**
   * Use to apply selected styling.
   * @default false
   */
  selected?: boolean;
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled?: boolean;
}


export interface SidebarItemContextProps
  extends Partial<SidebarItemProps> {
  id: string;
  onClick: (itemId: string, item: OutletRoute) => void;
  isMini?: boolean;
  isSidebarFullyExpanded?: boolean;
  isSidebarFullyCollapsed?: boolean;
  renderNestedNavigation: (subNavigation: Navigation) => React.ReactNode;
}


export type FieldErrors = {
  required?: string;
  invalid?: string;
  error?: string;
  min?: string;
  max?: string;
  pattern?: string;
};


export type HTMLProps<T = any> = React.HTMLAttributes<T> & {
  ref?: React.Ref<T> | undefined;
};

/**
 * Shape of the render prop: a function that takes props to be spread on the element and component's state and returns a React element.
 *
 * @template Props Props to be spread on the rendered element.
 * @template State Component's internal state.
 */
export type ComponentRenderFn<Props, State> = (
  props: Props,
  state: State,
) => React.ReactElement<unknown>;

export type BaseUIEvent<E extends React.SyntheticEvent<Element, Event>> = E & {
  preventBaseUIHandler: () => void;
  readonly baseUIHandlerPrevented?: boolean | undefined;
};


type WithPreventBaseUIHandler<T> = T extends (event: infer E) => any
  ? E extends React.SyntheticEvent<Element, Event>
    ? (event: BaseUIEvent<E>) => ReturnType<T>
    : T
  : T extends undefined
    ? undefined
    : T;

/**
 * Adds a `preventBaseUIHandler` method to all event handlers.
 */
export type WithBaseUIEvent<T> = {
  [K in keyof T]: WithPreventBaseUIHandler<T[K]>;
};

/**
 * Props shared by all Base UI components.
 * Contains `className` (string or callback taking the component's state as an argument) and `render` (function to customize rendering).
 */
export type BaseUIComponentProps<
  ElementType extends React.ElementType,
  State,
  RenderFunctionProps = HTMLProps,
> = Omit<
  WithBaseUIEvent<React.ComponentPropsWithRef<ElementType>>,
  'className' | 'color' | 'defaultValue' | 'defaultChecked'
> & {
  /**
   * CSS class applied to the element, or a function that
   * returns a class based on the component’s state.
   */
  className?: string | ((state: State) => string | undefined) | undefined;
  /**
   * Allows you to replace the component’s HTML element
   * with a different tag, or compose it with another component.
   *
   * Accepts a `ReactElement` or a function that returns the element to render.
   */
  render?: React.ReactElement | ComponentRenderFn<RenderFunctionProps, State> | undefined;
  /**
   * Style applied to the element, or a function that
   * returns a style object based on the component’s state.
   */
  style?: React.CSSProperties | ((state: State) => React.CSSProperties | undefined) | undefined;
};

export interface NativeButtonProps {
  /**
   * Whether the component renders a native `<button>` element when replacing it
   * via the `render` prop.
   * Set to `false` if the rendered element is not a button (e.g. `<div>`).
   * @default true
   */
  nativeButton?: boolean | undefined;
}

export interface NonNativeButtonProps {
  /**
   * Whether the component renders a native `<button>` element when replacing it
   * via the `render` prop.
   * Set to `true` if the rendered element is a native button.
   * @default false
   */
  nativeButton?: boolean | undefined;
}

/**
 * Simplifies the display of a type (without modifying it).
 * Taken from https://effectivetypescript.com/2022/02/25/gentips-4-display/
 */
export type Simplify<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

export type Orientation = 'horizontal' | 'vertical';

export type DeviceSelector = {
  uniqueIds?: string[];
  ids?: number[];
  readonly by?: "unique" | "id" | "*";
  setAll(): void;
  setUniqueIds(ids: string[]): void;
  setIds(ids: number[]): void;
  reset(): void;
  get(): DeviceSelector;
};