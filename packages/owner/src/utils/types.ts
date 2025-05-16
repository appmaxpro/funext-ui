


export type ThemeMode = 'dark' | 'light' | 'system';

export interface NavSubheaderItem {
  kind: 'header';
  title: string;
}

export interface NavDividerItem {
  kind: 'divider';
}

interface RouteAction {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  type?: 'sidebar' | 'bottomNav' | 'tab';

}

export interface NavRoute extends RouteAction{
  kind?: 'page' | 'modal';
  segment?: string;
  pattern?: string;
  children?: Routes;
  actions?: RouteAction[];
  isolate?: boolean;
}

export interface PageRoute extends NavRoute{
  kind?: 'page';
}

export interface ModalRoute extends NavRoute{
  kind?: 'modal';
  getModalProps(props:any): any;
} 

export type OutletRoute = PageRoute | ModalRoute;

export type RouteItem = OutletRoute | NavSubheaderItem | NavDividerItem;

export type Routes = RouteItem[];

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
  renderNestedNavigation: (subNavigation: Routes) => React.ReactNode;
}