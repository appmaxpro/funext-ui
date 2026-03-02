import {
  buildNavigation,
  getItemPath,
  getNavTitle,
  isOutletRoute,
  matchPath,
} from "~/utils/navigation";
import type {
  Breadcrumb,
  Navigation,
  NavigationObject,
  NavItem,
  Navigation as NavRoutes,
  OutletRoute,
} from "~/utils/types";
import React from "react";
import { NavigationContext, useNavigationContext } from "~/context";

import authNav from "./navs/auth";
import dashboardNav from "./navs/dashboard";
import RouteView, { getNullView } from "./route-view";
import { useViewStore, type ViewState } from "~/store/views";
import {
  Route,
  Routes,
  type RouteObject,
  type RouteProps,
  renderMatches,
} from "react-router";

export default function NavigationProvider({
  children,
  navigation: navigationProps,
  root,
}: {
  children: React.ReactNode;
  navigation?: NavRoutes;
  root?: OutletRoute;
}) {
  const navigation: NavigationObject = React.useMemo(
    () => ({
      navigation: navigationProps ? navigationProps : buildNavigation([dashboardNav, authNav], RouteView),
      root,
      isRoot: !root,
    }),
    [navigationProps],
  );
  /*
  const add = useViewStore((state) => state.add);

  const remove = useViewStore((state) => state.remove);

  const current = useViewStore((state) => state.current);

  React.useEffect(() => {
    const currView = current();
    if (!currView) {
    }
    function onNavigate(ev: NavigateEvent) {
      //ev.hashChange
      console.log("NavigationProvider::NavigateEvent:", ev);
    }
    window.navigation.addEventListener("navigate", onNavigate);
    return () => window.navigation.removeEventListener("navigate", onNavigate);
  }, []);
  */

  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
}

function createRoute(navItem: NavItem, index: number): React.ReactNode {
  if (isOutletRoute(navItem)) {
    const {
      children,
      hasErrorBoundary,
      path,
      Component = getNullView(navItem),
      id
    } = navItem;

    const route: RouteProps = {
      path,
      Component,
    };

    //if (!path && !route.children) (route as any).index = true;
    if (hasErrorBoundary) route.hasErrorBoundary = true;
    if (id) route.id = id;

    if (!path) delete route.path;
    if (children && children.length) {
      const Component = route.Component;
      //@ts-ignore
      if (route.Component?.nullView) {
        delete route.Component;
        if (navItem.isolate) {
          route.element = (
            <NavigationProvider navigation={children} root={navItem}>
              <NavigationRoutes />
            </NavigationProvider>
          );
        } else {
          route.element = <ChildRoutes navigation={children} />;
        }
      } else {
        const Component = route.Component!;
        const props = { routes: children, root: navItem } as any;
        route.element = <Component {...props} />;
        delete route.Component;
      }
    }
    return <Route {...route} key={index}/>;
  }
}

export function NavigationRoutes() {
  const { root, navigation } = useNavigationContext();
  const routes = React.useMemo(() => {
    const routes = (navigation || []).map(createRoute).filter(Boolean);
    console.log("NavigationRoutes:: routes:", routes);
    return <Routes location={root?.path}>{routes}</Routes>;
  }, navigation);

  return routes;
}

function ChildRoutes({ navigation}: { navigation: NavRoutes }) {
  const routes = React.useMemo(() => {
    const routesChildren = (navigation || []).map(createRoute).filter(Boolean);
    console.log("ChildRoutes:: routes:", navigation);
    return <Routes>{routesChildren}</Routes>;
  }, navigation);

  return routes;
}


export {
  createRoute as createNavRoute
}
//function getViewState()
