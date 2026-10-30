import React from "react";
import { HttpWatch } from "~/components/http-watch";
import { Layout } from "~/components/layout/layout";
import { EMPTY_OBJECT, type OutletRoute } from "~/utils";
import RouteView from "./route-view";
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
    let isLayout = false;
    while (layoutRoute) {
      if (layoutRoute.props?.isLayout) {
        relRoute = layoutRoute;
        isLayout = true;
        break;
      }
      layoutRoute = layoutRoute.parent as OutletRoute;
    }

    const { layout } = relRoute?.props as any ?? EMPTY_OBJECT;

    return (
      <Layout {...layout}>
        <RouteView route={relRoute} />
        <HttpWatch />
      </Layout>
    );
  }, [route]);

  return children;
});
(RouteLayout as any).displayName = "RouteLayout";
(RouteLayout as any).Protected = true;
