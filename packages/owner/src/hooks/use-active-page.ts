'use client';
import * as React from 'react';
import { useNavContext } from '../context';
import { getItemPath, getNavTitle, matchPath } from '../utils/navigation';
import type { Breadcrumb, OutletRoute } from '../utils/types';
import { useRouter } from './use-router';

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
  const router = useRouter();
  //const routerContext = React.useContext(RouterContext);
  //const navigator = useNavigation


  //const activeItem = route;

  //const rootItem = matchPath(navigation, '/');

  return React.useMemo(() => {
    
    const activeItem = router.route;
    console.log("useActivePage:: route:", activeItem )
    if (!activeItem) {
      console.warn("No active page for path:", router.location.pathname)
      return null as any;
    }
    let root = activeItem;
    while(root.parent)
      root = root.parent

    const breadcrumbs: Breadcrumb[] = [];

    if (root) {
      breadcrumbs.push({
        title: getNavTitle(root),
        path: '/',
      });
    }

    const segments = router.location.pathname.split('/').filter(Boolean);
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
      title: activeItem.title,
      path: location.pathname,
      breadcrumbs,
      navItem: activeItem,
      root
    };
  }, [router]);
}