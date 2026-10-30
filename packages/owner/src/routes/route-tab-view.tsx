import { memo } from "react";
import type { NavRoute } from "~/utils/types";
import RouteView from "./route-view";

export const RouteTabView = memo(function ({
  route,
  inTabs,
  visible
}: {
  route: NavRoute;
  visible?: boolean;
  inTabs?: boolean;

}) {


  if (visible === false) {
    console.log("NavRouteView:: Not visible ...");
    return null;
  }

  return <RouteView route={route} />;
});