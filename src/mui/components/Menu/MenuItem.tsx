import React, { ReactNode } from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { styled } from "../../styles";

// types
import {
  ListItemButton, 
  ListItemButtonProps, 
  ListItem
} from "../List";

import { Menu, type MenuProps } from "./Menu";
import { MenuHandler } from "./MenuHandler";
export interface MenuItemProps extends Omit<ListItemButtonProps, 'li'> {
  children: React.ReactNode;
  text?: ReactNode;
  label?: string;
  button?:boolean;
  menuProps?: Omit<MenuProps, 'children'>
  menu?: boolean,
  listProps?: any,
  ListComp?: React.ComponentType | string
}


const ListItemButtonRoot = styled(ListItemButton, {
  name: 'MuxMenuItemButton',
  slot: 'Root',
})('');

const ListItemRoot = styled(ListItem, {
  name: 'MuxMenuItem',
  slot: 'Root',
})('');


export const MenuItem = React.forwardRef<
  HTMLButtonElement,
  MenuItemProps & (React.ButtonHTMLAttributes<HTMLButtonElement> | React.ButtonHTMLAttributes<HTMLAnchorElement>)
>(({ 
  className = "", 
  disabled = false, 
  text,
  label,
  children,
  button=true,
  menuProps,
  menu = !!menuProps,
  ListComp= (Menu as any).List,
  listProps,
   ...rest 
  }, ref) => {
  // 1. init
  const { menu:menuTheme } = useTailwindTheme();
  const {
    styles: { base },
  } = menuTheme;

  // 2. set styles
  const menuItemClasses = twMerge(
    classnames(objectsToString(base.item.initial), {
      [objectsToString(base.item.disabled)]: disabled,
    }),
    className,
  );
  const rChildren = React.Children.toArray(children);
  //const items = rChildren.filter(m => (m as any).type === MenuItem );

  const Comp:React.FC<ListItemButtonProps> = ((button && rest.onClick) ? ListItemButtonRoot : ListItemRoot) as any;

  if (!menu) {
    return (
      <Comp {...(rest as any)} 
            ref={ref} 
            role="menuitem" 
            disabled={disabled}
            className={menuItemClasses}>
  
        <div className="grow min-w-0 ">
          {children || text}
        </div>
        {label && <div className="inline-flex">{label}</div>} 
      </Comp>
    );
  }

  //const itemChildren = rChildren.filter(m => menu[0] !== m);
  //const {children:menuChildren, ...mProps} = (menu[0] as any).props;

  // 4. return
  return (
    <Menu {...menuProps}>
      <MenuHandler {...rest} 
          ref={ref} 
          role="menuitem" 
          disabled={disabled}
          li={!button}
          className={menuItemClasses}>
        <Comp>
          <div className="grow min-w-0 ">
            {text}
          </div>
          {label && <div className="inline-flex">{label}</div>} 
        </Comp>
      </MenuHandler>
      <ListComp {...listProps}>
        {children}
      </ListComp>
    </Menu>
  );
});


MenuItem.displayName = "Mux.MenuItem";

export default MenuItem;
