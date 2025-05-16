'use client';
import * as React from 'react';
import { RouteContext } from '../context';
import { getItemPath, getNavTitle, matchPath } from '../utils/navigation';
import type { Breadcrumb } from '../utils/types';
import { useLocation, useNavigation } from 'react-router';

export interface ActivePage {
  title: string;
  path: string;
  breadcrumbs: Breadcrumb[];
}

export function useActivePage(): ActivePage | null {
  const navigationContext = React.useContext(RouteContext);
  const location = useLocation();
  //const routerContext = React.useContext(RouterContext);
  const pathname = location?.pathname ?? '/';
  const activeItem = matchPath(navigationContext, pathname);

  const rootItem = matchPath(navigationContext, '/');

  return React.useMemo(() => {
    if (!activeItem) {
      return null;
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
      const item = matchPath(navigationContext, path);
      if (!item) {
        continue;
      }
      const itemPath = getItemPath(navigationContext, item);
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
      path: getItemPath(navigationContext, activeItem),
      breadcrumbs,
    };
  }, [activeItem, rootItem, pathname, navigationContext]);
}