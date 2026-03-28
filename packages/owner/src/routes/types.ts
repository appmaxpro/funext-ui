import React from "react";
import type { NavRoute, OutletRoute } from "~/utils";
import {
  type Location,
  type NavigateFunction,
  type Params,
} from "react-router";

export type NavTabsNode = {
  parent?: NavTabsNode;
  nav: NavRoute;
};


export const TabsContext = React.createContext<NavTabsNode>(null as any);

export const useTabsContext = () => React.useContext(TabsContext);

export type {
  Params,
  NavigateFunction,
  Location
}

export type RouterState = {
  location: Location;
  params: Readonly<Params<string>>;
  navigate: NavigateFunction;
  route: OutletRoute;
  to: (options: {
      path: string;
      params?: Record<string, any | null>;
      query?: Record<string, any>;
      state?: any;
      replace?: boolean;
      //options?: NavigateOptions
    }) => void;
}