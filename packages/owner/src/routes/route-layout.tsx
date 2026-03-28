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
    const { layout, props, model, custom } = route?.props as any;
    if (true) {
      <div>gggggggggggggg</div>;
    }
    if (!custom) {
      return "Not Custom";
      //return <Outlet />;
    }

    const Comp = (
      route.Component && route.Component != RouteView
        ? route.Component
        : route?.CP && route.Component != RouteView
          ? PAGES[route.CP as keyof typeof PAGES] || getNullView(route)
          : getNullView(route)
    ) as React.ComponentType;

    return (
      <Layout {...layout}>
        {model ? <DataViews Comp={Comp} {...props} /> : <Comp {...props} />}
        <HttpWatch />
      </Layout>
    );
  }, [route]);

  return children;
});
(RouteLayout as any).displayName = "RouteLayout";
(RouteLayout as any).Protected = true;
