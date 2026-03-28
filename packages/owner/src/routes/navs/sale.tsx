import { RouteTabs } from "~/scope/views/data/data-view-tabs";
import type { NavRoute } from "~/utils/types";
import RouteView from "../route-view";
import { Icons } from "~/components";

export default [
  {
    title: "Sales Regions",
    path: "states",
    icon: <Icons.ShoppingCart />,
    childNav: false,
    props: {
      custom: true
    },  
    children: [
      {
        CP: "SaleTargetStates",
        props: {
          model: "states",
          custom: true
        },
      },
      {
        path: ":state_id",
        CP: "SaleTargetStates",
        props: {
          model: "states",
          custom: true
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
    props: {
      custom: true
    },
    children: [
      {
        CP: "SaleTargetBranches",
        type: "tab",
        title: "Revenue",
        path: ':branch_id',
        Component: RouteView,
        props: {
          model: `branches`,
          custom: true
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
          custom: true
        },
      },
    ],
  },
] as const satisfies NavRoute[];
