import React, { ReactNode } from "react";
import { styled } from "../../styles";

// types
import { ListItemButton, ListItemButtonProps, ListItem } from "../List";

import { setValidItemTypes } from "./utils";

interface ItemProps<E extends HTMLElement>  {
  forwardedRef: React.ForwardedRef<E>
  render: (index:number, activeIndex:number|null, ref: (node: E | null) => void) => React.ReactNode
}


export interface MenuItemProps extends Omit<ListItemButtonProps, "li"> {
  children: React.ReactNode;
  text?: ReactNode;
  label?: string;
  button?: boolean;
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
      ...rest
    },
    ref,
  ) => {

    const clickable = button || rest.onClick;
    const Comp: React.FC<ListItemButtonProps> = (
      clickable ? ListItemButtonRoot : ListItemRoot
    ) as any;
    
    return (
      <Comp {...(rest as any)} ref={ref} role="menuitem" disabled={disabled}>
        <div className="grow min-w-0 ">{children || text}</div>
        {label && <div className="inline-flex">{label}</div>}
      </Comp>
    );
  }
);

MenuItem.displayName = "Mux.MenuItem";

setValidItemTypes(MenuItem);

export default MenuItem;
