import React from "react";

import type {
  FloatingContext,
  ReferenceType,
  FloatingTreeType,
  ArrowOptions,
  UseInteractionsReturn,
} from "@floating-ui/react";

// types
import { Handler } from "../../types/components/menu";

import type { ArrowProps, AnimationProps, Strategy } from "../../types/generic";
import { MuxFloatingProvider, useFloatingContext } from "../Context";

export type MenuContextProps<T extends HTMLElement = HTMLButtonElement> = {
  open: boolean;
  handler?: Handler;
  setInternalOpen: Handler;
  strategy: Strategy;
  x: number;
  y: number;
  reference: (instance: T | null) => void;
  positionReference?: (instance: T | null) => void;
  floating: (node: HTMLElement | null) => void;
  listItemsRef: React.MutableRefObject<any[]>;
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  getItemProps: UseInteractionsReturn["getItemProps"];
  animate: boolean;
  lockScroll?: boolean;
  context: FloatingContext<ReferenceType>;
  tree: FloatingTreeType<ReferenceType>;
  allowHover: boolean;
  internalAllowHover: boolean;
  activeIndex: number;
  setActiveIndex: Handler<number>;
  nested: boolean;
  arrow?: ArrowProps;
  arrowRef?: ArrowOptions["element"];
  disablePortal?: boolean;
  rtl?: boolean;
  nav?: boolean;
};

export interface MenuContextProviderProps {
  value: MenuContextProps;
  children: React.ReactNode;
}

export const MenuContext = React.createContext<null | MenuContextProps>(null);
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
