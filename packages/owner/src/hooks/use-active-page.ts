'use client';
import * as React from 'react';
import { useNavContext } from '../context';
import { getItemPath, getNavTitle, matchPath } from '../utils/navigation';
import type { Breadcrumb, Navigation, NavItem, OutletRoute } from '../utils/types';
import { useLocation, matchPath as routeMatchPath, matchRoutes, useNavigate, useNavigation } from 'react-router';

export interface ActivePage {
  title: string;
  path: string;
  breadcrumbs: Breadcrumb[];
  navItem: OutletRoute;
  root: OutletRoute;
  state?: any;
}

export function useActivePage(): ActivePage | null {
  const navigation = useNavContext();
  const location = useLocation();
  //const routerContext = React.useContext(RouterContext);
  const pathname = location?.pathname ?? '/';
  //const navigator = useNavigation


  const activeItem = matchPath(navigation, pathname);

  const rootItem = matchPath(navigation, '/');

  return React.useMemo(() => {
    if (!activeItem) {
      console.warn("No active page for path:", pathname)
      return null as any;
    }
    

    const breadcrumbs: Breadcrumb[] = [];

    if (rootItem) {
      breadcrumbs.push({
        title: getNavTitle(rootItem),
        path: '/',
      });
    }

    const segments = pathname.split('/').filter(Boolean);
    let prefix = '';
    for (const segment of segments) {
      const path = `${prefix}/${segment}`;
      prefix = path;
      const item = matchPath(navigation, path);
      if (!item) {
        continue;
      }
      const itemPath = getItemPath(navigation, item);
      const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastCrumb?.path !== itemPath) {
        breadcrumbs.push({
          title: getNavTitle(item),
          path: itemPath,
        });
      }
    }

    return {
      title: getNavTitle(activeItem),
      path: getItemPath(navigation, activeItem),
      breadcrumbs,
      navItem: activeItem,
      root: rootItem
    };
  }, [activeItem, rootItem, pathname, navigation]);
}