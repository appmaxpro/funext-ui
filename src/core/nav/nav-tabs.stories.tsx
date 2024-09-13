import React from 'react';

import type { Meta, StoryObj } from "@storybook/react";

import { MaterialIcon } from "../../icons/material-icon";
import { Box } from "../box";
import { NavTabItem, NavTabs as Tabs } from "./nav-tabs";

const meta = {
  title: "Components/Nav",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const items: NavTabItem[] = [
  {
    id: "1",
    title: "Messaging",
    icon: () => <MaterialIcon icon="chat" />,
    iconColor: "violet",
  },
  {
    id: "2",
    title: "Teamwork",
    icon: () => <MaterialIcon icon="person" />,
    iconColor: "green",
  },
  {
    id: "3",
    title: "Documents",
    icon: () => <MaterialIcon icon="folder" />,
    iconColor: "blue",
  },
  {
    id: "4",
    title: "Marketing",
    icon: () => <MaterialIcon icon="call" />,
    iconColor: "orange",
  },
  {
    id: "5",
    title: "Purchases",
    icon: () => <MaterialIcon icon="shopping_bag" />,
    iconColor: "hotpink",
  },
  {
    id: "6",
    title: "CRM",
    icon: () => <MaterialIcon icon="support_agent" />,
    iconColor: "purple",
  },
  {
    id: "7",
    title: "Invoicing",
    icon: () => <MaterialIcon icon="receipt_long" />,
    iconColor: "teal",
  },
];
export function NavTabs() {

  const [activeTab, setActiveTab] = React.useState(items[0]) ;
  
  return (
    <Box>
      <Box
        p={2}
        overflow="hidden"
        className="border"
        maxWidth="100%"
        width="max-content"
        style={{
          resize: "horizontal",
        }}
      >
        <Tabs items={items} onItemClick={setActiveTab} active={activeTab.id}/>
      </Box>
    </Box>
  );
};
