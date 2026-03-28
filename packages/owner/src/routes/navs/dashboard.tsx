import saleNav from './sale'
import type { NavRoute } from "~/utils/types";
import { Icons } from '~/components';
import authNav from "./auth";
import resNav from "./res";
import { RouterProvider } from '../router-provider';
import Home from '~/pages/smb/home/home';

export default {
    kind: "page",
    path: "/",
    hasErrorBoundary: true,
    Component: RouterProvider,
    actions: ["bottomNav", "sidebar"],
    props: {
      custom: true
    },
    children: [
      {
        title: "Dashboard",
        icon: <Icons.Dashboard />,
        ///CP: 'Dashboard',
        Component: Home,
        actions: ["tab", "sidebar"],
        props: {
          custom: true
        },
      },
      {
        title: "Settings",
        icon: <Icons.Settings />,
        CP: 'Settings',
        actions: ["tab"],
        path: 'settings',
        props: {
          custom: true
        },
      },
      {
        title: "Account",
        icon: <Icons.Person />,
        CP: 'Account',
        actions: ["tab"],
        path: 'account',
        props: {
          custom: true
        },
      },
      ...saleNav,
      authNav,
      resNav
    ]

} as const satisfies NavRoute