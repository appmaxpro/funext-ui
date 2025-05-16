"use client";
import { Menu as MMenu, type MenuProps, type TriggerProps } from "./Menu";
import { MenuItem, MenuItemProps } from "./MenuItem";
import { useMenu } from "./MenuContext";
import ItemDivider from "../List/ItemDivider";
import MenuHeader from "./MenuHeader";

export type {
  MenuProps,
  TriggerProps,
  MenuItemProps,
};


export const Menu = Object.assign(MMenu, {
  Item: MenuItem,
  Divider: ItemDivider,
  Header: MenuHeader,
});

export default Menu;
export {
  ItemDivider as MenuDivider,
  MenuHeader,
  MenuItem,
  useMenu,
};
