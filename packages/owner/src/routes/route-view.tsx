import React from "react";
import { useActivePage } from "~/hooks/use-active-page";
import * as PAGES from "../pages";
import type { NavRoute, OutletRoute } from "~/utils/types";
import { isNavTabsMounted, useNavContext, useTabsContext } from "~/context";
import { NavRouteTabs } from "~/components/views/data-view-tabs";
import { useIsMounted } from "@funext/ui";
import { getItemPath } from "~/utils/navigation";

const RouteView: React.ComponentType<{ children?: JSX.Element, inTabs?: boolean }> = ({
  children,
  inTabs
}) => {
  const activePage = useActivePage();
  const nav = activePage?.navItem;
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

  if (nav?.type === 'tabs') {
    return (
      <ViewTabs nav={nav}>
        {children}
      </ViewTabs>
    );
  }



  return (
    children || (Comp ? <Comp /> : children || `Null view path: ${nav?.path}`)
  );
};

const ViewTabs = ({
  nav,
  children,
  Comp,
  childNav
}: {
  nav: NavRoute;
  children?: React.ReactNode;
  Comp?: React.ComponentType | null | undefined;
  childNav?: NavRoute;
}) => {
  const tabsNode = useTabsContext();
  const mounted = useIsMounted();

  if (mounted && !isNavTabsMounted(nav, tabsNode)) {
    return <NavRouteTabs nav={nav} />;
  }

  return (
    children || ((Comp && Comp !== RouteView)  ? <Comp /> : children || `Null view in path: ${childNav?.path}`)
  );
};

const nullViewsCache = new WeakMap<NavRoute, React.FunctionComponent>()

export function getNullView(nav: NavRoute) {
  if (nullViewsCache.has(nav)) {
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
