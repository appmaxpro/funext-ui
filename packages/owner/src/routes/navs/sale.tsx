import { RouteTabs } from "~/scope/views/data/data-view-tabs";
import type { NavRoute } from "~/utils/types";
import RouteView from "../route-view";
import { Icons } from "~/components";

export default [
  {
    title: "Sales Regions",
    path: "states",
    icon: <Icons.ShoppingCart />,
    showNav: true,
    childNav: false,
    children: [
      {
        CP: "SaleTargetStates",
        props: {
          model: "odata/states",
          custom: true
        },
      },
      {
        path: ":state_id",
        CP: "SaleTargetStates",
        props: {
          model: "odata/states",
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
      isLayout: true,
    },
    children: [
      {
        CP: "SaleTargetBranches",
        type: "tab",
        title: "Revenue",
        path: ':branch_id',
        props: {
          model: `odata/branches`,
        },
      },
      {
        CP: "SaleTargetBranches",
        type: "tab",
        title: "Expense",
        path: ":branch_id/expense",
        props: {
          model: `odata/branches/expense`,
        },
      },
    ],
  },
] as const satisfies NavRoute[];
