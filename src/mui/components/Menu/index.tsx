import { Menu, MenuProps } from "./Menu";
import { MenuHandler, MenuHandlerProps } from "./MenuHandler";
import { MenuList, MenuListProps } from "./MenuList";
import { MenuItem, MenuItemProps } from "./MenuItem";
import { useMenu } from "./MenuContext";
import { MenuSubList } from "./MenuSubItems";
import ItemDivider from "../List/ItemDivider";
import MenuHeader from "./MenuHeader";
import { setValidItemTypes } from "./utils";

import { MenuButton, MenuButtonProps } from "./MenuButton";

export { MenuButton, ItemDivider as MenuDivider, MenuHeader };

// @ts-ignore
Menu.Button = MenuButton;

export type {
  MenuProps,
  MenuHandlerProps,
  MenuListProps,
  MenuItemProps,
  MenuButtonProps,
};

setValidItemTypes(MenuItem, MenuButton);

const MMenu = Object.assign(Menu, {
  Handler: MenuHandler,
  List: MenuList,
  Item: MenuItem,
  Divider: ItemDivider,
  Header: MenuHeader,
  Button: MenuButton,
});

export default MMenu;
export { MMenu as Menu, MenuHandler, MenuList, MenuItem, MenuSubList, useMenu };
