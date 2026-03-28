import * as React from "react";
import type { NavRoute, Navigation, OutletRoute } from "../utils/types";

export function RouterProvider(): React.ReactNode;

export const RouteTabView: React.ExoticComponent<{
  route: NavRoute;
  inTabs?: boolean;
}>;

export const ViewTabs: React.FC<{
  nav: NavRoute;
  children?: React.ReactNode;
  Comp?: React.ComponentType | null | undefined;
  childNav?: NavRoute;
}>;

export const RouteView: React.ComponentType<{
  children?: JSX.Element;
  inTabs?: boolean;
}>;

export const NavigationProvider: React.FC<{
  children: React.ReactNode;
  navigation?: Navigation;
  root?: OutletRoute;
}>;


export function Routes(): React.ReactNode;