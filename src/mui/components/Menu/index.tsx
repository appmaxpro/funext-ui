export * from './Menu';
import {Menu, MenuProps} from "./Menu";
import { MenuHandler, MenuHandlerProps } from "./MenuHandler";
import { MenuList, MenuListProps } from "./MenuList";
import { MenuItem, MenuItemProps } from "./MenuItem";
import { useMenu } from "./MenuContext";
import {MenuSubList} from './MenuSubItems';
import ItemDivider from '../List/ItemDivider';
import MenuHeader from './MenuHeader';
import {setValidItemTypes} from './utils';

export { Menu, MenuHandler, MenuList, MenuItem, MenuSubList, useMenu };

import { MenuButton, MenuButtonProps } from "./MenuButton";

export {MenuButton, ItemDivider as MenuDivider, MenuHeader};

// @ts-ignore
Menu.Button = MenuButton;

export type { MenuProps, MenuHandlerProps, MenuListProps, MenuItemProps, MenuButtonProps };

setValidItemTypes(MenuItem, MenuButton);


export default Object.assign(Menu, { Handler: MenuHandler, List: MenuList, Item: MenuItem, Divider:ItemDivider, Header:MenuHeader, Button: MenuButton  });