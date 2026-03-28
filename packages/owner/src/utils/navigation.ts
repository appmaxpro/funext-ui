import { pathToRegexp } from "path-to-regexp";
import invariant from "invariant";
import type {
  Navigation,
  NavItem,
  NavRoute,
  PageRoute,
  ModalRoute,
  OutletRoute,
  NavSubheaderItem,
} from "./types";

export const getItemKind = (item: NavItem) => item.kind ?? "page";

export const isOutletRoute = (item: NavItem): item is OutletRoute =>
  ["page", "modal"].includes(getItemKind(item));

export const isPageRoute = (item: NavItem): item is PageRoute =>
  getItemKind(item) === "page";

export const isModalRoute = (item: NavItem): item is ModalRoute =>
  getItemKind(item) === "modal";

export const getNavTitle = (item: OutletRoute | NavSubheaderItem) => {
  return isOutletRoute(item) ? (item.title ?? item.path ?? "") : item.title;
};

/**
 * Builds a map of Nav page items to their respective paths. This map is used to quickly
 * lookup the path of a Nav item. It will be cached for the lifetime of the Nav.
 */
function buildItemToPathMap(routes: Navigation): Map<NavItem, string> {
  const map = new Map<NavItem, string>();

  const visit = (item: NavItem, base: string) => {
    if (isOutletRoute(item)) {
      // Append segment to base path. Make sure to always have an initial slash, and slashes between segments.
      let path =
        `${base.startsWith("/") ? base : `/${base}`}${base && base !== "/" && item.path ? "/" : ""}${item.path || ""}` ||
        "/";

      path = path.replaceAll(/\/\//g, "/");
      map.set(item, path);
      if (item.children) {
        for (const child of item.children) {
          visit(child, path);
        }
      }
    }
  };

  for (const item of routes) {
    visit(item, "");
  }

  return map;
}

const itemToPathMapCache = new WeakMap<Navigation, Map<NavItem, string>>();

/**
 * Gets the cached map of Routes page items to their respective paths.
 */
function getItemToPathMap(routes: Navigation) {
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
function buildItemLookup(routes: Navigation) {
  const map = new Map<string | RegExp, OutletRoute>();
  const visit = (item: NavItem) => {
    if (isOutletRoute(item)) {
      const path = getItemPath(routes, item);
      const keyExists = map.has(path);
      if (keyExists) {
        console.warn(`Duplicate path in routes: ${path} of item:\n${item}`);
      }

      if (!keyExists || !item.path) {
        map.set(path, item);
        const pattern =
          item.pattern ||
          (item.path && /(\:|\?)/.test(item.path) ? item.path : null);
        if (pattern) {
          const basePath = item.path ? path.slice(0, -item.path.length) : path;
          map.set(pathToRegexp(basePath + pattern), item);
          item.pattern = pattern;
        }
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
const itemLookupMapCache = new WeakMap<
  Navigation,
  Map<string | RegExp, OutletRoute>
>();
function getItemLookup(routes: Navigation) {
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
export function matchPath(
  routes: Navigation,
  path: string,
): OutletRoute | null {
  const lookup = getItemLookup(routes);
  
  for (const [key, item] of lookup.entries()) {
    if (typeof key === "string" && key === path) {
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
export function getItemPath(routes: Navigation, item: OutletRoute): string {

  const map = getItemToPathMap(routes);
  const path = map.get(item);
  
  if(!path) {
    if(item.parent) {
      return getItemPath(routes, item.parent)
    }
    console.warn(`Item (${item.title}) not found in routes: `, routes)
  }

  invariant(path, `Item (${item.title}) not found in routes: ${routes}`);

  return path;
}

/**
 * Checks if a specific Nav page item has the active page as a child item.
 */
export function hasSelectedNavChildren(
  routes: Navigation,
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

export function hasSelectedRoute(current: OutletRoute, active: OutletRoute): boolean {
  return current.path === active.path
}

export function hasSelectedChildren(current: OutletRoute, active: OutletRoute): boolean {
  //if(active === current) return true
  if (current.children) {
    return current.children.some((nestedItem) => {
      if (!isOutletRoute(nestedItem)) {
        return false;
      }

      if (nestedItem.children) {
        return hasSelectedChildren(nestedItem, active);
      }

      return nestedItem === active;
    });
  }
  return false
}

export function buildNavigation(routes: Navigation, fallbackComponent?: any) {
  const visit = (item: NavItem) => {
    const itemCopy = {...item}
    if (isOutletRoute(item)) {
      
      if (item.children) {
        delete (itemCopy as OutletRoute).children;
        const children:Navigation = [];
        (itemCopy as OutletRoute).children = children;

        for (let child of item.children) {
          children.push(child = visit(child));

          if (!(child as any).parent)
            Object.defineProperties(child, {
              parent: {
                get: () => itemCopy,
              },
            });
        }
      }
    }
    return itemCopy;
  };
  
  const copy:Navigation = [];
  for (const item of routes) {
    copy.push(visit(item));
  }

  return copy;
}
