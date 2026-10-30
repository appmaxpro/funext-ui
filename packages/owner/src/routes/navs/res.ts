import React from "react";
import { Icons } from "~/components/shared/icons";
import { TabLayout } from "~/scope/routes/tab-layout";
import { View } from "~/scope/routes/view";
import { viewLoader } from "~/scope/utils/view-loader";
import type { NavRoute } from "~/utils";

const loader = {
  load: viewLoader,
  type: 'xml'
}

export default {
  path: "/res",
  title: 'Resource',
  showNav: false,
  childNav: true,
  Component: TabLayout,
  children: [
    {
      title: 'Actions',
      path: ":action/:mode?/:id?",
      Component: View,
      icon: React.createElement(Icons.LocalShipping),
      props: {
        params: {
        }
      }
    },

  ],
} satisfies NavRoute;
