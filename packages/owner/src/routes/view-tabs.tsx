import type { NavRoute } from "~/utils";
import { useTabsContext, type NavTabsNode } from "./types";
import { NavRouteTabs } from "~/scope/views";
import { useIsMounted } from "@funext/ui";

const isNavTabsMounted = (
  nav: NavRoute,
  node?: NavTabsNode,
): boolean => {
  if (!node) return false;
  if (node.nav === nav) return true;

  return isNavTabsMounted(nav, node.parent);
};


export const ViewTabs = ({
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
    children || (Comp  && <Comp /> || `Null view in path: ${childNav?.path}`)
  );
};