import PersonIcon from "@funext/icons/Person";
import DashboardIcon from "@funext/icons/Dashboard";
import SettingsIcon from "@funext/icons/Settings";
import saleNav from './sale'
import { ProtectedRoute } from "../protected-route";
import type { NavRoute } from "~/utils/types";

export default {
    kind: "page",
    path: "/",
    hasErrorBoundary: true,
    Component: ProtectedRoute,
    actions: ["bottomNav", "sidebar"],
    children: [
      {
        title: "Dashboard",
        icon: <DashboardIcon />,
        CP: 'Dashboard',
        actions: ["tab", "sidebar"],
      },
      {
        title: "Settings",
        icon: <SettingsIcon />,
        CP: 'Settings',
        actions: ["tab", "sidebar"],
        path: 'settings'
      },
      {
        title: "Account",
        icon: <PersonIcon />,
        CP: 'Account',
        actions: ["tab", "sidebar"],
        path: 'account'
      },
      ...saleNav
    ]

} as const satisfies NavRoute