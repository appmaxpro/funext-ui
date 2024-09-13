import React from "react";

// types
import { Menu, type MenuProps } from "./Menu";
import { MenuHandler } from "./MenuHandler";
import { MenuItem } from "./MenuItem";

export interface MenuButtonProps extends MenuProps {
  content: React.ReactNode;
  listProps?: any,
  ListComp?: React.ComponentType | string
}

export const MenuButton = React.forwardRef<
  HTMLButtonElement,
  MenuButtonProps
>(({ 
  content,
  children,
  ListComp= (Menu as any).List,
  listProps,
   ...rest 
  }, ref) => {
  
  //const rChildren = React.Children.toArray(children);
  //const items = rChildren.filter(m => (m as any).type === MenuItem );

  //const itemChildren = rChildren.filter(m => menu[0] !== m);
  //const {children:menuChildren, ...mProps} = (menu[0] as any).props;

  // 4. return
  return (
    <Menu {...rest}>
      <MenuHandler
          ref={ref} 
          role="menuitem">
        {content}
      </MenuHandler>
      <ListComp {...listProps}>
        {children}
      </ListComp>
    </Menu>
  );
});

MenuButton.displayName = "Mux.MenuButton";

export default MenuButton;
