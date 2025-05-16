import React from "react";

import {
  type FloatingContext,
  type ReferenceType,
  type FloatingTreeType,
  type ArrowOptions,
  type UseInteractionsReturn,
  useListItem,
} from "@floating-ui/react";

// types
import { Handler, MenuDismissProps } from "./types";

import type { ArrowProps, AnimationProps, Strategy } from "../../types/generic";
import { MuxFloatingProvider, useFloatingContext } from "../Context";
import { createGlobalScopedContext } from "../../lib/createGlobalScopedContext";
import { EMPTY_RECORD } from "../../lib/constants";

export type MenuContextProps<T extends HTMLElement = HTMLButtonElement> = {
  context: FloatingContext<T>;
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  getItemProps: UseInteractionsReturn["getItemProps"];
  
  allowHover: boolean;
  setAllowHover: React.Dispatch<React.SetStateAction<boolean>>;
  arrowRef?: ArrowOptions["element"];
  rtl?: boolean;
  navigation?: boolean;
  nested: boolean;
  closeOnItemClick?: boolean;
};

export interface MenuContextProviderProps {
  value: MenuContextProps;
  children: React.ReactNode;
}

export const MenuContext = createGlobalScopedContext<null | MenuContextProps>(
  '@funext/ui/context/menu', null);

MenuContext.displayName = "Mux.MenuContext";

export function useMenu() {
  const context = React.useContext(MenuContext);

  if (!context) {
    throw new Error(
      "useMenu() must be used within a Menu. It happens when you use MenuCore, MenuHandler, MenuItem or MenuList components outside the Menu component.",
    );
  }

  return context;
}

export const MenuContextProvider = ({
  value,
  children,
}: MenuContextProviderProps) => {
  const floating = useFloatingContext();
  if (!floating || floating.type !== "menu") {
    return (
      <MuxFloatingProvider type="menu" context={value.context}>
        <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
      </MuxFloatingProvider>
    );
  }
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

MenuContextProvider.displayName = "Mux.MenuContextProvider";


export const MenuListContext = createGlobalScopedContext<null | MenuContextProps>(
  '@funext/ui/context/menu/list', null);

  export interface UseMenuItemProps {
    label?: string | null;
  }

export function useMenuItem(props: UseMenuItemProps|undefined = EMPTY_RECORD) : {
  ref: (node: HTMLElement | null) => void;
  index: number;
} {
  const {index, ref} = useListItem(props);
  return {index, ref}

}