import * as React from 'react';

export interface NavigateProps {
  to: string | {
    pathname: string;
    search?: string;
    hash?: string;
  };
  replace?: boolean;
  state?: any;
}

export interface NavigateProps {
  to: string | {
    pathname: string;
    search?: string;
    hash?: string;
  };
  replace?: boolean;
  state?: any;
}

export interface LinkProps extends NavigateProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
}

export interface NavigateOptions {
  history?: 'auto' | 'push' | 'replace';
  state?: any;
}

export interface OutletProps {
  /**
    Provides a context value to the element tree below the outlet. Use when the parent route needs to provide values to child routes.

    ```tsx
    <Outlet context={myContextValue} />
    ```

    Access the context with {@link useOutletContext}.
   */
  context?: unknown;
  children?: React.ReactNode;
}

/**
 * Abstract router used by Toolpad components.
 */
export interface Router {
  pathname: string;
  searchParams: URLSearchParams;
  navigate: (url: string | URL, options?: NavigateOptions) => void;
  back: ()=> void;
  Outlet: React.FC<OutletProps>;
  state?: any;
}

export interface NavPageItem {
  kind?: 'page';
  segment?: string;
  title?: string;
  icon?: React.ReactNode;
  pattern?: string;
  action?: React.ReactNode;
  children?: Nav;
}

export interface NavSubheaderItem {
  kind: 'header';
  title: string;
}

export interface NavDividerItem {
  kind: 'divider';
}

export type NavItem = NavPageItem | NavSubheaderItem | NavDividerItem;

export type Nav = NavItem[];

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



export interface AppProviderProps {
  /**
   * The content of the app provider.
   */
  children: React.ReactNode;
  /**
   * Navigation definition for the app.
   * @default []
   */
  nav?: Nav;
  /**
   * Router implementation used inside Toolpad components.
   * @default null
   */
  router?: Router;

  //Link?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;

  Navigate?: React.FC<NavigateProps>;
}