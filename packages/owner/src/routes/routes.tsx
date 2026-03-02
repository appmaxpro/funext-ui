import { createElement, useMemo } from "react";

import type { RouteObject } from "react-router";

import {
  RouterProvider,
  createBrowserRouter,
  UNSAFE_RouteContext,
  UNSAFE_DataRouterContext
} from "react-router";
import { useNavContext } from "../context";
import type { NavItem } from "../utils/types";
import { isOutletRoute } from "../utils/navigation";
import NavigationProvider, { NavigationRoutes } from "./navigation-provider";
import { getNullView } from "./route-view";

//@ts-ignore
function createRouteObject(navItem: NavItem): RouteObject {
  if (isOutletRoute(navItem)) {
    const {
      children,
      hasErrorBoundary,
      path,
      Component = getNullView(navItem),
    } = navItem;

    const routeChildren = children
      ? children.map(createRouteObject).filter(Boolean)
      : null;

    const route: RouteObject =
      routeChildren?.length && !navItem.isolate
        ? {
            path,
            Component,
            children: routeChildren,
          }
        : {
            path,
            Component,
          };

    //if (!path && !route.children) (route as any).index = true;
    if (hasErrorBoundary) route.hasErrorBoundary = true;

    if (!path) delete route.path;
    if (navItem.isolate && children?.length) {
      //@ts-ignore
      const Component = route.Component.nullView
        ? NavigationRoutes
        : route.Component!;

      route.element = (
        <NavigationProvider navigation={children} root={navItem}>
          {createElement(Component)}
        </NavigationProvider>
      );
      

      delete route.Component;
    }

    return route;
  }
}

export function Routes() {
  const navigation = useNavContext();
  const router = useMemo(() => {
    const routes = (navigation || []).map(createRouteObject).filter(Boolean);

    console.log("Route::createBrowserRouter: routes:", routes);
    return createBrowserRouter(routes, {
      //@ts-ignore
      unstable_instrumentations: [logging],
      async patchRoutesOnNavigation({ patch, path }) {
          console.log("Route::patchRoutesOnNavigation:", path)
      }
    });
  }, []);
  

  return <RouterProvider router={router}></RouterProvider>;
}

const logging = {
  router({ instrument }: { instrument: any }) {
    instrument({
      navigate: (impl: any, info: any) =>
        logExecution(`navigate ${info.to}`, impl),
      fetch: (impl: any, info: any) => logExecution(`fetch ${info.to}`, impl),
    });
  },
  route({ instrument, id }: { instrument: any; id: any }) {
    instrument({
      middleware: (impl: any, info: any) =>
        logExecution(`middleware ${info.request.url} (route ${id})`, impl),
      loader: (impl: any, info: any) =>
        logExecution(`loader ${info.request.url} (route ${id})`, impl),
      action: (impl: any, info: any) =>
        logExecution(`action ${info.request.url} (route ${id})`, impl),
    });
  },
};

async function logExecution(label: string, impl: () => Promise<void>) {
  let start = performance.now();
  console.log(`start ${label}`);
  await impl();
  let duration = Math.round(performance.now() - start);
  console.log(`end ${label} (${duration}ms)`);
}
