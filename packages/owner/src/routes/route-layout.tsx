import React from "react";
import { DataViews } from "~/scope/views/data/data-views";
import { Layout } from "~/components/layout/layout";
import * as PAGES from "../pages";
import { HttpWatch } from "~/components/http-watch";
import RouteView, { getNullView } from "./route-view";
import type { OutletRoute } from "~/utils";
import { Outlet, useRouter } from "~/hooks/use-router";
import type { Params } from "./types";

export const RouteLayout = React.memo<{
  route: OutletRoute;
  params: Params<string>;
}>(function ({ route, params }) {
  //const { route, params } = useRouter();
  console.log("RouteLayout:", route);
  const children = React.useMemo(() => {
    let relRoute = route;
    let layoutRoute = route;
    while (layoutRoute) {
      if (layoutRoute.props?.isLayout) {
        relRoute = layoutRoute;
        break;
      }
      layoutRoute = layoutRoute.parent as OutletRoute;
    }

    const { layout, props, model, custom } = relRoute?.props as any;

    const Comp = (
      relRoute.Component && relRoute.Component != RouteView
        ? relRoute.Component
        : relRoute?.CP && relRoute.Component != RouteView
          ? PAGES[relRoute.CP as keyof typeof PAGES] || getNullView(relRoute)
          : getNullView(relRoute)
    ) as React.ComponentType;

    return (
      <Layout {...layout}>
        {model ? (
          <DataViews Comp={Comp} {...props} model={model} />
        ) : (
          <Comp {...props} />
        )}
        <HttpWatch />
      </Layout>
    );
  }, [route]);

  return children;
});
(RouteLayout as any).displayName = "RouteLayout";
(RouteLayout as any).Protected = true;
