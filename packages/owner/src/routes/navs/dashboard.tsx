import saleNav from "./sale";
import type { NavRoute } from "~/utils/types";
import { Icons } from "~/components";
import authNav from "./auth";
import resNav from "./res";
import { RouterProvider } from "../router-provider";
import Home from "~/pages/smb/home/home";

export default {
  kind: "page",
  path: "/",
  hasErrorBoundary: true,
  Component: RouterProvider,
  actions: ["bottomNav", "sidebar"],
  children: [
    {
      title: "Dashboard",
      icon: <Icons.Dashboard />,
      ///CP: 'Dashboard',
      Component: Home,
      actions: ["tab", "sidebar"],
    },
    {
      title: "Settings",
      icon: <Icons.Settings />,
      CP: "Settings",
      actions: ["tab"],
      path: "settings",
      props: {
        lazy: true,
      },
    },
    {
      title: "Account",
      icon: <Icons.Person />,
      CP: "Account",
      actions: ["tab"],
      path: "account",
      props: {
        lazy: true,
      },
    },
    {
      path: "/tracking",
      title: "Tracking",
      CP: "TackingLayout",
      props: {
        isLayout: true,
        lazy: true,
        layout: {
          enable: false,
        },
      },
      //showNav: false,
      
    },
    ...saleNav,
    authNav,
    resNav,
  ],
} as const satisfies NavRoute;
