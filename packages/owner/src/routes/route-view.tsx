import { useIsMounted } from "@funext/ui";
import React from "react";
import { NavRouteTabs } from "~/scope/views/data/data-view-tabs";
import { useNavContext } from "~/context";
import { useActivePageRoute } from "~/hooks";
import { getItemPath } from "~/utils/navigation";
import type { NavRoute, OutletRoute } from "~/utils/types";
import * as PAGES from "../pages";
import { useTabsContext, type NavTabsNode } from "./types";
import { ViewTabs } from "./view-tabs";

const RouteView: React.ComponentType<{
  children?: JSX.Element;
  inTabs?: boolean;
}> = ({ children, inTabs }) => {
  const nav = useActivePageRoute();
  return (
    <OutletView inTabs={inTabs} route={nav}>
      {children}
    </OutletView>
  );
};

const OutletView: React.ComponentType<{
  children?: JSX.Element;
  inTabs?: boolean;
  route?: OutletRoute;
}> = ({ children, inTabs, route }) => {
  const nav = route;
  console.log("View::activePage:", nav);

  const Comp = React.useMemo(
    () =>
      (nav?.CP &&
        (PAGES[nav.CP as keyof typeof PAGES] as React.ComponentType)) ||
      (RouteView !== nav?.Component ? nav?.Component : null),
    [nav],
  );

  if (!inTabs && nav?.parent?.type === "tabs") {
    return (
      <ViewTabs Comp={Comp} nav={nav.parent} childNav={nav}>
        {children}
      </ViewTabs>
    );
  }

  if (nav?.type === "tabs") {
    return <ViewTabs nav={nav}>{children}</ViewTabs>;
  }

  return (
    children || (Comp ? <Comp /> : children || `Null view path: ${nav?.path}`)
  );
};

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
