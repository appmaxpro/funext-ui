
import { NavTabs } from "./nav-tabs";

// import global utils for external apps
import "../utils/globals";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./layout.module.scss";

import React from "react";
import { useTabs,} from "./use-tabs";
import { useDialogs } from "~/hooks/use-dialogs";
import { EMPTY_ARRAY } from "~/utils";
import { Outlet, useLocation } from "react-router";
import { useScreenSize } from "@funext/ui";
import type { CloseTab, Tab } from "../types";

export function Layout() {


  const { mdDown:isMobile } = useScreenSize()
  const {pathname} = useLocation();


  const [tabContainer, tabContainerRef] = useState<HTMLDivElement | null>(null);

  const tabbable = pathname === "/" || pathname.startsWith("/res/");
  const tabsPortal = isMobile || !tabbable ? null : tabContainer;

  return (
    <div
      id="main-container-set"
    >
      <div className="" id="main-content-set">
        <div className="tabs">
          <NavTabs container={tabsPortal} />
          <div className="page">
            <Outlet />
          </div>
        </div>
      </div>
      <PopupsProvider />
    </div>
  );

}


interface PopupViewProps {
  tab: Tab;
  closePopup: CloseTab;
  closeDialog: (tab: Tab) => void;
}

function PopupView<PopupViewProps, R extends any = {}>(props: PopupViewProps) {
  return "";
}


export interface OpenPopupDialog {
  /**
   * Open a confirmation dialog. Returns a promise that resolves to true if
   * the user confirms, false if the user cancels.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves to true if the user confirms, false if the user cancels.
   */
  (tab: Tab): Promise<boolean>;
}

function PopupsProvider() {
  const { popups, open, close } = useTabs();
  const { open: openDialog, close: closeDialog } = useDialogs();
  const map = useMemo(() => new Map<string, Promise<any>>(), EMPTY_ARRAY);

  const closePopupDialog = React.useCallback(
    (tab: Tab) => {
      close(tab.id);
      map.delete(tab.id);

    },
    [closeDialog],
  );

  const openPopup = React.useCallback<OpenPopupDialog>(
    (tab) =>
      openDialog(
        PopupView,
        { tab, closePopup: close, closeDialog: closePopupDialog },
        {
          onClose: async (result: any) => {
            closePopupDialog(tab);
            //return true;
          },
        },
      ),
    [open],
  );

  useEffect(() => {
    const newOpened = popups.filter((tab) => !map.has(tab.id));

    const closedIds = map
      .keys()
      .filter((key) => !popups.some((tab) => tab.id === key));

    closedIds.forEach((key) => {
      closeDialog(map.get(key)!, false);
      map.delete(key);
    });

    newOpened.forEach((tab) => {
      const promo = openPopup(tab)
      map.set(tab.id, promo);
    });
  }, [popups]);


  return null;
}
