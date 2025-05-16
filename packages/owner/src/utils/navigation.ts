import { pathToRegexp } from 'path-to-regexp';
import invariant from 'invariant';
import type {
  Routes,
  RouteItem,
  NavRoute,
  PageRoute,
  ModalRoute,
  OutletRoute,
  NavSubheaderItem,
} from './types';

export const getItemKind = (item: RouteItem) => item.kind ?? 'page';


export const isOutletRoute = (item: RouteItem): item is OutletRoute =>
  ['page', 'modal'].includes(getItemKind(item));

export const isPageRoute = (item: RouteItem): item is PageRoute =>
  getItemKind(item) === 'page';

export const isModalRoute = (item: RouteItem): item is ModalRoute =>
  getItemKind(item) === 'modal';


export const getNavTitle = (item: OutletRoute | NavSubheaderItem) => {
  return isOutletRoute(item) ? (item.title ?? item.segment ?? '') : item.title;
};

/**
 * Builds a map of Nav page items to their respective paths. This map is used to quickly
 * lookup the path of a Nav item. It will be cached for the lifetime of the Nav.
 */
function buildItemToPathMap(routes: Routes): Map<RouteItem, string> {
  const map = new Map<RouteItem, string>();

  const visit = (item: RouteItem, base: string) => {
    if (isOutletRoute(item)) {
      // Append segment to base path. Make sure to always have an initial slash, and slashes between segments.
      const path =
        `${base.startsWith('/') ? base : `/${base}`}${base && base !== '/' && item.segment ? '/' : ''}${item.segment || ''}` ||
        '/';
      map.set(item, path);
      if (item.children) {
        for (const child of item.children) {
          visit(child, path);
        }
      }
    }
  };

  for (const item of routes) {
    visit(item, '');
  }

  return map;
}

const itemToPathMapCache = new WeakMap<Routes, Map<RouteItem, string>>();

/**
 * Gets the cached map of Routes page items to their respective paths.
 */
function getItemToPathMap(routes: Routes) {
  let map = itemToPathMapCache.get(routes);
  if (!map) {
    map = buildItemToPathMap(routes);
    itemToPathMapCache.set(routes, map);
  }
  return map;
}

/**
 * Build a lookup map of paths to Nav items. This map is used to match paths against
 * to find the active page.
 */
function buildItemLookup(routes: Routes) {
  const map = new Map<string | RegExp, OutletRoute>();
  const visit = (item: RouteItem) => {
    if (isOutletRoute(item)) {
      const path = getItemPath(routes, item);
      if (map.has(path)) {
        console.warn(`Duplicate path in routes: ${path}`);
      }

      map.set(path, item);
      if (item.pattern) {
        const basePath = item.segment ? path.slice(0, -item.segment.length) : path;
        map.set(pathToRegexp(basePath + item.pattern), item);
      }
      if (item.children) {
        for (const child of item.children) {
          visit(child);
        }
      }
    }
  };
  for (const item of routes) {
    visit(item);
  }
  return map;
}
const itemLookupMapCache = new WeakMap<Routes, Map<string | RegExp, OutletRoute>>();
function getItemLookup(routes: Routes) {
  let map = itemLookupMapCache.get(routes);
  if (!map) {
    map = buildItemLookup(routes);
    itemLookupMapCache.set(routes, map);
  }
  return map;
}

/**
 * Matches a path against the routes to find the active page. i.e. the page that should be
 * marked as selected in the routes.
 */
export function matchPath(routes: Routes, path: string): OutletRoute | null {
  const lookup = getItemLookup(routes);

  for (const [key, item] of lookup.entries()) {
    if (typeof key === 'string' && key === path) {
      return item;
    }
    if (key instanceof RegExp && key.test(path)) {
      return item;
    }
  }

  return null;
}

/**
 * Gets the path for a specific Routes page item.
 */
export function getItemPath(routes: Routes, item: OutletRoute): string {
  const map = getItemToPathMap(routes);
  const path = map.get(item);
  invariant(path, `Item not found in routes: ${item.title}`);
  return path;
}

/**
 * Checks if a specific Nav page item has the active page as a child item.
 */
export function hasSelectedNavChildren(
  routes: Routes,
  item: OutletRoute,
  activePagePath: string,
): boolean {
  if (item.children) {
    return item.children.some((nestedItem) => {
      if (!isOutletRoute(nestedItem)) {
        return false;
      }

      if (nestedItem.children) {
        return hasSelectedNavChildren(routes, nestedItem, activePagePath);
      }

      return activePagePath === getItemPath(routes, nestedItem);
    });
  }

  return false;
}