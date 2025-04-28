'use client';
import * as React from 'react';
import { NavContext, RouterContext } from '../shared/context';
import { getItemPath, getItemTitle, matchPath } from '../shared/navigation';
import type { Breadcrumb } from '../app';
import { useRouter } from './useRouter';

export interface ActivePage {
  title: string;
  path: string;
  breadcrumbs: Breadcrumb[];
}

export function useActivePage(): ActivePage | null {
  const nav = React.useContext(NavContext);
  const {pathname = '/'} = useRouter() ?? {} as any;
  

  return React.useMemo(() => {
    const activeItem = matchPath(nav, pathname);

    const rootItem = matchPath(nav, '/');

    if (!activeItem) {
      return null;
    }

    const breadcrumbs: Breadcrumb[] = [];

    if (rootItem) {
      breadcrumbs.push({
        title: getItemTitle(rootItem),
        path: '/',
      });
    }

    const segments = pathname.split('/').filter(Boolean);
    let prefix = '';
    for (const segment of segments) {
      const path = `${prefix}/${segment}`;
      prefix = path;
      const item = matchPath(nav, path);
      if (!item) {
        continue;
      }
      const itemPath = getItemPath(nav, item);
      const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastCrumb?.path !== itemPath) {
        breadcrumbs.push({
          title: getItemTitle(item),
          path: itemPath,
        });
      }
    }

    return {
      title: getItemTitle(activeItem),
      path: getItemPath(nav, activeItem),
      breadcrumbs,
    };
  }, [pathname, nav]);
}