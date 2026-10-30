import React from "react";
import { useNavContext } from "~/context";
import { DataViews } from "~/scope/views";
import { getItemPath } from "~/utils/navigation";
import type { NavRoute, OutletRoute } from "~/utils/types";
import * as PAGES from "../pages";
import { Loader } from "~/components";
import { EMPTY_OBJECT } from "~/utils";
import { Outlet } from "react-router";

function RouteView({ route }: { route: OutletRoute }) {
  console.log("RouteView:", route);

  const children = React.useMemo(() => {

    if(route.Component && !route.CP) {
       //return <Outlet/>
    }

    const Comp = ((route.CP
      ? PAGES[route.CP as keyof typeof PAGES]
      : route.Component) ?? getNullView(route)) as React.FunctionComponent;

    const { props, model, lazy } = route.props as any ?? EMPTY_OBJECT;
    if (model) {
      return <DataViews Comp={Comp as any} {...props} model={model} />;
    }
    if (lazy) {
      return (
        <React.Suspense fallback={<Loader />}>
          <Comp {...props}/>
        </React.Suspense>
      );
    }
    return <Comp {...props}/>
  }, [route]);

  return children;
}

const nullViewsCache = new WeakMap<NavRoute, React.FunctionComponent>();

export function getNullView(nav: NavRoute) {
  if (!nullViewsCache.has(nav)) {
    function Comp() {
      const navigation = useNavContext();

      return "Null Route View in " + getItemPath(navigation, nav);
    }

    Comp.displayName = nav.path;
    Comp.nullView = true;
    nullViewsCache.set(nav, Comp);
  }

  return nullViewsCache.get(nav);
}

export default RouteView;
