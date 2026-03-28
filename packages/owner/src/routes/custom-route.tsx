import React from "react";
import { DataViews } from "~/scope/views/data/data-views";
import { Layout } from "~/components/layout/layout";
import * as PAGES from "../pages";
import { HttpWatch } from "~/components/http-watch";
import RouteView, { getNullView } from "./route-view";
import type { OutletRoute } from "~/utils";



type Props = {
  route: OutletRoute;
  params?: any;
} 
export const CustomRoute = React.memo<Props>(
  function ({route, params}) {
    
    const {layout, props, model} = React.useMemo(() => {
      const {layout, props, model} = route?.props as any;
      return {layout, props, model};
    }, [route]);


    const children = React.useMemo(
      () =>{

        const Comp = (route?.CP && route.Component != RouteView
            ? PAGES[route.CP as keyof typeof PAGES] || getNullView(route)
            : getNullView(route)) as React.ComponentType;
       
        return (
          model
          ? <DataViews Comp={Comp} {...props} /> 
          : <Comp {...props}/>
        )
      },
      [route],
    );


    return (
      <Layout {...layout}
      >
        {children}
        <HttpWatch />
      </Layout>
    );
  }
);
(CustomRoute as any).displayName = "CustomRoute";
(CustomRoute as any).Protected = true;
