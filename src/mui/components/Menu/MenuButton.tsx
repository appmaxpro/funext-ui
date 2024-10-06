import React from "react";

// types
import { Menu, type MenuProps } from "./Menu";
import { MenuHandler } from "./MenuHandler";
import { MenuItem } from "./MenuItem";

export interface MenuButtonProps extends React.ComponentProps<any> {
  trigger: React.ReactNode;
  listProps?: any;
  ListComp?: React.ComponentType | string;
  menuProps?: MenuProps;
}

export const MenuButton = React.forwardRef<
  HTMLButtonElement,
  MenuButtonProps
>(({ 
  trigger,
  children,
  ListComp= (Menu as any).List,
  listProps,
  menuProps,
   ...rest 
  }, ref) => {
  
  //const rChildren = React.Children.toArray(children);
  //const items = rChildren.filter(m => (m as any).type === MenuItem );

  //const itemChildren = rChildren.filter(m => menu[0] !== m);
  //const {children:menuChildren, ...mProps} = (menu[0] as any).props;

  // 4. return
  return (
    <Menu placement="top-end" {...menuProps}>
      <MenuHandler role="menuitem" {...rest} ref={ref}>
        {trigger}
      </MenuHandler>
      <ListComp {...listProps}>
        {children}
      </ListComp>
    </Menu>
  );
});

MenuButton.displayName = "Mux.MenuButton";

export default MenuButton;
