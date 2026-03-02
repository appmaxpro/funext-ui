import { memo } from "react";
import { useParams, Outlet } from "react-router";
import type { NavRoute } from "~/utils/types";
import * as PAGES from "../pages";
import { Views } from "~/components/views/data-views";
import RouteView from "./route-view";
import { useVisibility } from "~/hooks/use-visibility";

function NullView(props: any) {
  return <div {...props}/>;
}

export const RouteTabView = memo(function({route, inTabs}: {route: NavRoute, inTabs?: boolean}) {
  const params = useParams();
  
  const visible = useVisibility();
  
  if (!visible){
    console.log("NavRouteView:: Not visible ...")
    return null;
  }

  const props = (typeof route.props === "function"
      ? route.props(params)
      : route.props) || {}

  let Comp = route.CP
    ? PAGES[route.CP as keyof typeof PAGES] || NullView
    : route.Component || NullView;
  
  if (Comp === RouteView) Comp = NavComp;

  return <Views Comp={Comp} {...props}/>
})

const NavComp = () => {
  return <RouteView inTabs/>
}