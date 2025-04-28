import React, { ReactNode } from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { styled } from "../../styles";

// types
import { ListItemButton, ListItemButtonProps, ListItem } from "../List";

import { Menu, type MenuProps } from "./Menu";
import { MenuHandler } from "./MenuHandler";
import { useMenu } from "./MenuContext";
import { useListItem } from "@floating-ui/react";
import { useRefs } from "../../hooks";


interface ItemProps<E extends HTMLElement>  {
  forwardedRef: React.ForwardedRef<E>
  render: (index:number, activeIndex:number|null, ref: (node: E | null) => void) => React.ReactNode
}

function Item<E extends HTMLElement>({ render, forwardedRef }:ItemProps<E>) {
    const { activeIndex } = useMenu();
    const { ref: aRef, index } = useListItem();
    const ref = useRefs<E | null>(forwardedRef, aRef as (node: E | null) => void);
    const isActive = activeIndex === index;
    return render(index, activeIndex, ref as ((node: E | null) => void))
}

export interface MenuItemProps extends Omit<ListItemButtonProps, "li"> {
  children: React.ReactNode;
  text?: ReactNode;
  label?: string;
  button?: boolean;
  menuProps?: Omit<MenuProps, "children">;
  menu?: boolean;
  listProps?: any;
  ListComp?: React.ComponentType | string;
}

const ListItemButtonRoot = styled(ListItemButton, {
  name: "MuxMenuItemButton",
  slot: "Root",
})({
  flexGrow: 1,
  minWidth: 0,
});

const ListItemRoot = styled(ListItem, {
  name: "MuxMenuItem",
  slot: "Root",
})({
  flexGrow: 1,
  minWidth: 0,
});

export const MenuItem = React.forwardRef<
  HTMLButtonElement,
  MenuItemProps &
    (
      | React.ButtonHTMLAttributes<HTMLButtonElement>
      | React.ButtonHTMLAttributes<HTMLAnchorElement>
    )
>(
  (
    {
      className = "",
      disabled = false,
      text,
      label,
      children,
      button = true,
      menuProps,
      menu = !!menuProps,
      ListComp = (Menu as any).List,
      listProps,
      ...rest
    },
    ref,
  ) => {

    const Comp: React.FC<ListItemButtonProps> = (
      button && rest.onClick ? ListItemButtonRoot : ListItemRoot
    ) as any;
    
    if (!menu) {
      

      return (
        <Comp {...(rest as any)} ref={ref} role="menuitem" disabled={disabled}>
          <div className="grow min-w-0 ">{children || text}</div>
          {label && <div className="inline-flex">{label}</div>}
        </Comp>
      );
    }

    //const itemChildren = rChildren.filter(m => menu[0] !== m);
    //const {children:menuChildren, ...mProps} = (menu[0] as any).props;

    // 4. return
    return (
      <Menu {...menuProps}>
        <MenuHandler
          {...rest}
          ref={ref}
          role="menuitem"
          disabled={disabled}
          li={!button}
        >
          <ListItemRoot>
            <div className="grow min-w-0 ">{text}</div>
            {label && <div className="inline-flex">{label}</div>}
          </ListItemRoot>
        </MenuHandler>
        <ListComp {...listProps}>{children}</ListComp>
      </Menu>
    );
  },
);

MenuItem.displayName = "Mux.MenuItem";



export default MenuItem;
