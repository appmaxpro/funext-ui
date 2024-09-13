// @ts-nocheck
import BiCaretLeftFill from "bootstrap-icons/icons/caret-left-fill.svg?react";
import BiCaretRightFill from "bootstrap-icons/icons/caret-right-fill.svg?react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ArrowNavigation } from "../arrow-navigation";
import { isElementDisabled, isElementHidden } from "../../mui/components/List/utils";
import { Box } from "../box";
import { Menu as AxMenu, MenuHandler, MenuList, MenuButton, useSubMenu} from "../../mui";
import { MenuItem as AxMenuItem, Button } from "../../mui";
import { withStyled } from "../styled";
import { useClassNames, useTheme } from "../styles";
import { tryFocus } from "./utils";

import { useForwardedRef } from "../hooks";
import { Portal } from "../portal";
import styles from "./menubar.module.scss";
import { Chevron } from "../common";

const MenubarContext = React.createContext<any>({});

const useMenubar = () => useContext(MenubarContext);

function isSubmenu(menuItem: any) {
  return React.Children.toArray(menuItem.props.children).some(
    (child: any) => child.type === AxMenuItem,
  );
}

function getDefaultActive() {
  return { submenu: false, text: "" };
}

export const Menubar = withStyled(Box)((props, ref) => {
  const [active, setActive] = useState<string | undefined>(undefined);
  const [show, setShow] = useState<boolean>(false);
  const { children } = props;

  const { dir } = useTheme();
  const rtl = dir === "rtl";

  const [beforeElements, menus, afterElements] = useMemo(() => {
    const all = React.Children.toArray(children).flat();
    const menuStartIndex = all.findIndex(
      (item: any) => item && item.type === MenuButton,
    );
    return [
      all.slice(0, menuStartIndex),
      all.filter((child: any) => child.type === MenuButton && child.props.content),
      all.slice(menuStartIndex).filter((item: any) => item?.type !== MenuButton),
    ];
  }, [children]);

  const showMenu = useCallback((text: string) => {
    setActive(text);
    setShow(true);
  }, []);

  const hideMenu = useCallback(
    (text?: string) => {
      if (text && active !== text) return;
      setActive(text);
      setShow(false);
    },
    [active],
  );

  const getCurrentIndex = useCallback(
    () => menus.findIndex((item: any) => item.props.text === active),
    [menus, active],
  );

  const showNext = useCallback(() => {
    const current = getCurrentIndex();
    const menu: any = menus[(current + 1) % menus.length];
    showMenu(menu.props.text);
  }, [menus, showMenu, getCurrentIndex]);

  const showPrevious = useCallback(() => {
    const current = getCurrentIndex();
    const menu: any = menus[current === 0 ? menus.length - 1 : current - 1];
    showMenu(menu.props.text);
  }, [menus, showMenu, getCurrentIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const { key } = event;
      switch (key) {
        case "ArrowRight": {
          const action = rtl ? showPrevious : showNext;
          action();
          break;
        }
        case "ArrowLeft": {
          const action = rtl ? showNext : showPrevious;
          action();
          break;
        }
        case "Escape": {
          hideMenu();
          break;
        }
        case "Tab": {
          event.preventDefault();
          if (event.shiftKey) {
            showPrevious();
          } else {
            showNext();
          }
        }
      }
    },
    [rtl, showNext, showPrevious, hideMenu],
  );

  const menubarRef = useForwardedRef<HTMLDivElement>(ref);
  const value = useMemo(
    () => ({ rtl, menubarRef, hideMenu }),
    [rtl, menubarRef, hideMenu],
  );

  return (
    <MenubarContext.Provider value={value}>
      <ArrowNavigation selector="auto-horizontal">
        <Box ref={menubarRef} d="flex" {...props}>
          {children}
        </Box>
      </ArrowNavigation>
    </MenubarContext.Provider>
  );
});
