import DashboardIcon from "@funext/icons/Dashboard";
import ShoppingCartIcon from "@funext/icons/ShoppingCart";
import { RouteTabs } from "~/components/views/data-view-tabs";
import type { NavRoute } from "~/utils/types";
import RouteView from "../route-view";

export default [
  {
    title: "Sales Regions",
    path: "states",
    icon: <ShoppingCartIcon />,
    childNav: false,

    children: [
      {
        CP: "SaleTargetStates",
        props: {
          model: "states",
        },
      },
      {
        path: ":state_id",
        CP: "SaleTargetStates",
        props: {
          model: "states",
        },
        children: [],
      },
    ],
  },
  {
    kind: "page",
    path: "branches",
    type: "tabs",
    Component: RouteTabs,
    children: [
      {
        CP: "SaleTargetBranches",
        type: "tab",
        title: "Revenue",
        path: ':branch_id',
        Component: RouteView,
        props: {
          model: `branches`,
        },
      },
      {
        CP: "SaleTargetBranches",
        type: "tab",
        title: "Expense",
        path: ":branch_id/expense",
        Component: RouteView,
        props: {
          model: `branches/expense`,
        },
      },
    ],
  },
] as const satisfies NavRoute[];
