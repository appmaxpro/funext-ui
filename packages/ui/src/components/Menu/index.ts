"use client";
import { Menu as MMenu, MenuProps } from "./Menu";
import { MenuHandler, MenuHandlerProps } from "./MenuHandler";
import { MenuList, MenuListProps } from "./MenuList";
import { MenuItem, MenuItemProps } from "./MenuItem";
import { useMenu } from "./MenuContext";
import { MenuSubList } from "./MenuSubItems";
import ItemDivider from "../List/ItemDivider";
import MenuHeader from "./MenuHeader";
import { setValidItemTypes } from "./utils";

import { MenuButton, MenuButtonProps } from "./MenuButton";

export type {
  MenuProps,
  MenuHandlerProps,
  MenuListProps,
  MenuItemProps,
  MenuButtonProps,
};

setValidItemTypes(MenuItem, MenuButton);

const Menu = Object.assign(MMenu, {
  Handler: MenuHandler,
  List: MenuList,
  Item: MenuItem,
  Divider: ItemDivider,
  Header: MenuHeader,
  Button: MenuButton,
});

export default Menu;
export {
  MenuButton,
  ItemDivider as MenuDivider,
  MenuHeader,
  MenuHandler,
  MenuList,
  MenuItem,
  MenuSubList,
  useMenu,
};
