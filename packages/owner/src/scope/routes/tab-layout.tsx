import { NavTabs, SingleTab } from "./nav-tabs";

// import global utils for external apps
import { useEffect, useMemo, useRef, useState } from "react";

import React from "react";
import { useTabs } from "./use-tabs";
import { useDialogs } from "~/hooks/use-dialogs";
import { EMPTY_ARRAY } from "~/utils";
import { Box, Flex, Stack, useScreenSize } from "@funext/ui";
import type { CloseTab, Tab } from "../types";
import { useRouter, Outlet } from "~/hooks/use-router";
import { session } from "~/utils/session";

export function TabLayout() {
  const { mdDown: isMobile } = useScreenSize();
  const router = useRouter();

  const [tabContainer, tabContainerRef] = useState<HTMLDivElement | null>(null);

  const tabbable = location.pathname.startsWith("/res/");
  const tabsPortal =
    isMobile ||
    !tabbable ||
    session.info?.application?.singlePage !== false ||
    router?.route.props?.custom === true
      ? null
      : tabContainer;

  if (tabsPortal) {
    return (
      <Stack gap={2} className="parent-view" ref={tabContainerRef}>
        <SingleTab />
        <div className="page grow flex-1">
          <Outlet />
        </div>
      </Stack>
    );
  }
  return (
    <div id="main-container-set" className="parent-view">
      <Stack gap={2} className="parent-view">
        <Box
          width="100%"
          height="100%"
          data-ui="LayoutTabs"
          className="parent-view"
          ref={tabContainerRef}
        >
          <NavTabs container={tabsPortal} />
        </Box>
        <div className="page grow flex-1">
          <Outlet />
        </div>
      </Stack>
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
      const promo = openPopup(tab);
      map.set(tab.id, promo);
    });
  }, [popups]);

  return null;
}
