"use client";
import * as React from "react";
import {
  useTheme,
  type SxProps,
  Box,
  Flex,
  Drawer,
  drawerClasses,
  useScreenSize,
  Panel,
  type BottomNavigationProps,
} from "@funext/ui";

import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from "../../utils/ui";
import { AppBar, Toolbar } from "../shared/toolbar";
import { HideOnScroll } from "~/components/shared/hide-on-scroll";
import { LayoutContext, useNavContext } from "~/context";
import { NavigationSidebar } from "~/components/sidebar/navigation-sidebar";
import type { OutletRoute, Navigation, NavRoute } from "~/utils/types";
import { Account, type AccountProps } from "~/components/account/account";
import { AppTitle, type AppTitleProps } from "~/components/app/app-title";
import { Dimensions } from "~/utils/constant";
import { isOutletRoute } from "~/utils/navigation";
import { MenuIon } from "./menu-icon";
import { MemoAppBottomNavigation } from "./app-bottom-navigation";

export interface SidebarFooterProps {
  mini: boolean;
}

type AppBarExtProps = React.ComponentProps<typeof AppBar> & {
  isExpanded: boolean;
  toggleNavigationExpanded: () => void;
};

export interface AppLayoutSlotProps {
  appTitle?: AppTitleProps;
  toolbarActions?: {};
  toolbarAccount?: AccountProps;
  sidebarFooter?: SidebarFooterProps;
  bottomNavigation?: BottomNavigationProps;
  appBar?: React.ComponentProps<typeof AppBar>;
}

export interface AppLayoutSlots {
  /**
   * The component used for the app title section in the layout header.
   * @default Link
   */
  appTitle?: React.ElementType;
  /**
   * The toolbar actions component used in the layout header.
   * @default ToolbarActions
   */
  toolbarActions?: React.ComponentType<{}>;
  /**
   * The toolbar account component used in the layout header.
   * @default Account
   */
  toolbarAccount?: React.ComponentType<AccountProps>;
  /**
   * Optional footer component used in the layout sidebar.
   * @default null
   */
  sidebarFooter?: React.ComponentType<SidebarFooterProps>;

  bottomNavigation?: React.ComponentType<BottomNavigationProps>;

  appBar?: React.ComponentType<AppBarExtProps>;
}

export interface AppLayoutProps {
  /**
   * The content of the dashboard.
   */
  children: React.ReactNode;
  /**
   * Branding options for the dashboard.
   * @default null
   */
  branding?: React.ReactNode | null;

  // @TODO: Remove deprecated prop from v0.16.0 onwards
  /**
   * Routes definition for the dashboard. [Find out more](https://mui.com/toolpad/core/react-dashboard-layout/#navigation).
   * @default []
   * @deprecated Set the navigation in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/#navigation) instead.
   */
  routes?: Navigation;
  /**
   * Whether the sidebar should not be collapsible to a mini variant in desktop and tablet viewports.
   * @default true
   */
  miniSidebar?: boolean;
  /**
   * Whether the sidebar should start collapsed in desktop size screens.
   * @default false
   */
  defaultSidebarCollapsed?: boolean;
  /**
   * Whether the navigation bar and menu icon should be hidden
   * @default false
   */
  hideNavigation?: boolean;
  /**
   * Width of the sidebar when expanded.
   * @default 320
   */
  sidebarExpandedWidth?: number | string;

  /**
   * Render each page item.
   *
   * @param {OutletRoute} item
   * @param {{ mini: boolean }} params
   * @returns {ReactNode}
   */
  renderPageItem?: (
    item: OutletRoute,
    params: { mini: boolean },
  ) => React.ReactNode;

  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: AppLayoutSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: AppLayoutSlotProps;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps;

  hideTopOnScroll?: boolean;
  hideBottomOnScroll?: boolean;
  showBackIcon?: boolean;
}

function filterNavigation(navigation?: Navigation) {
  if (navigation) {
    let items = navigation.filter(
      (item) =>
        isOutletRoute(item) &&
        ((!item.type && item.showNav !== false) ||
          (item.type && item.type === "sidebar")),
    );

    if (items.length) {
      if (items.length === 1) {
        return filterNavigation((items[0] as NavRoute).children);
      }
      return items;
    }
  }
}

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [AppLayout API](https://mui.com/toolpad/core/api/dashboard-layout)
 */
function AppLayout(props: AppLayoutProps) {
  const {
    mdUp,
    mdDown,
    smUp: smUp,
    smDown,
    xsDown,
    xlUp,
    current,
    width,
  } = useScreenSize();

  const {
    children,
    miniSidebar = true,
    defaultSidebarCollapsed = !mdDown,
    hideNavigation: hideNavigationProps = false,
    sidebarExpandedWidth = 320,
    renderPageItem,
    slots,
    slotProps,
    sx,
    hideTopOnScroll,
    hideBottomOnScroll,
    showBackIcon = true,
    routes,
  } = props;

  const theme = useTheme();

  const navigationContext = useNavContext();
  const navigation = React.useMemo(
    () => filterNavigation(routes ?? navigationContext),
    [routes],
  );

  const hideNavigation = hideNavigationProps || !navigation;

  const [isNavigationExpanded, setIsNavigationExpanded] = React.useState(
    mdDown ? false : !defaultSidebarCollapsed,
  );

  const [isNavigationFullyExpanded, setIsNavigationFullyExpanded] =
    React.useState(isNavigationExpanded);

  const [isNavigationFullyCollapsed, setIsNavigationFullyCollapsed] =
    React.useState(!isNavigationExpanded);

  React.useEffect(() => {
    if (mdDown) {
      setIsNavigationExpanded(false);
    }
  }, [mdDown, setIsNavigationExpanded]);

  React.useEffect(() => {
    if (isNavigationExpanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsNavigationFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsNavigationFullyExpanded(false);

    return () => {};
  }, [isNavigationExpanded, theme]);

  React.useEffect(() => {
    if (!isNavigationExpanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsNavigationFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsNavigationFullyCollapsed(false);

    return () => {};
  }, [isNavigationExpanded, theme]);

  const selectedItemIdRef = React.useRef("");

  const handleSetNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setIsNavigationExpanded(newExpanded);
    },
    [setIsNavigationExpanded],
  );

  const toggleNavigationExpanded = React.useCallback(() => {
    setIsNavigationExpanded((state) => !state);
  }, [setIsNavigationExpanded]);

  const handleNavigationLinkClick = React.useCallback(() => {
    selectedItemIdRef.current = "";
    if (mdDown) setIsNavigationExpanded(false);
  }, [mdDown]);

  // If useEffect was used, the reset would also happen on the client render after SSR which we don't need

  React.useMemo(() => {
    if (navigationContext) {
      selectedItemIdRef.current = "";
    }
  }, [navigationContext]);

  const isMini = miniSidebar && !isNavigationExpanded;

  const contentRef = React.useRef<Node | null>(null);
  const [hasScrollerRef, setHasScrollerRef] = React.useState(false);
  const setScrollerRef = React.useCallback(
    (ref: HTMLElement | null) => {
      contentRef.current = ref;
      setHasScrollerRef(!!ref);
    },
    [setHasScrollerRef],
  );

  const hasDrawerTransitions = smUp && (!miniSidebar || !mdDown);
  const AppBarExt = slots?.appBar;
  const ToolbarActionsSlot = slots?.toolbarActions; //?? ToolbarActions;
  const ToolbarAccountSlot = slots?.toolbarAccount ?? Account;
  const SidebarFooterSlot = slots?.sidebarFooter ?? null;
  const BottomNavigationSlot =
    (slots?.bottomNavigation ?? smDown) ? MemoAppBottomNavigation : null;

  const getDrawerContent = React.useCallback(
    (isMini: boolean, viewport: "phone" | "tablet" | "desktop") => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden auto",
            pt: navigationContext[0]?.kind === "header" && !isMini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isNavigationFullyExpanded, "padding")
              : {}),
          }}
        >
          <NavigationSidebar
            subNavigation={navigation!}
            onLinkClick={handleNavigationLinkClick}
            isMini={isMini}
            isFullyExpanded={isNavigationFullyExpanded}
            isFullyCollapsed={isNavigationFullyCollapsed}
            hasDrawerTransitions={hasDrawerTransitions}
            sidebarExpandedWidth={sidebarExpandedWidth}
            renderPageItem={renderPageItem}
          />
          {SidebarFooterSlot ? (
            <SidebarFooterSlot mini={isMini} {...slotProps?.sidebarFooter} />
          ) : null}
        </Box>
      </React.Fragment>
    ),
    [
      SidebarFooterSlot,
      handleNavigationLinkClick,
      hasDrawerTransitions,
      isNavigationFullyExpanded,
      isNavigationFullyCollapsed,
      sidebarExpandedWidth,
      navigationContext,
      renderPageItem,
      slotProps?.sidebarFooter,
    ],
  );

  const getDrawerSharedSx = React.useCallback(
    (isMini: boolean, isTemporary: boolean) => {
      const drawerWidth = isMini
        ? Dimensions.sidebarMiniWidth
        : sidebarExpandedWidth;

      return {
        displayPrint: "none",
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(isNavigationExpanded),
        [`& .${drawerClasses.panel}`]: {
          //position: "absolute",
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundImage: "none",
          ...getDrawerWidthTransitionMixin(isNavigationExpanded),
        },
      };
    },
    [isNavigationExpanded, sidebarExpandedWidth],
  );

  const layoutRef = React.useRef<Element | null>(null);

  return (
    <LayoutContext.Provider
      value={React.useMemo(() => ({ setScrollerRef }), [setScrollerRef])}
    >
      <Box
        ref={layoutRef}
        position="relative"
        display="flex"
        overflow="hidden"
        height="100vh"
        width="100%"
        flexDirection="column"
        sx={sx}
        data-screen-current={current}
        data-screen-width={`${width}`}
        data-xs-down={`${xsDown}`}
        data-sm-down={`${smDown}`}
        data-md-down={`${mdDown}`}
      >
        <Box>
          <HideOnScroll
            target={contentRef.current}
            direction="down"
            enabled={hideTopOnScroll}
          >
            {AppBarExt ? (
              <AppBarExt
                {...slotProps?.appBar}
                isExpanded={isNavigationExpanded}
                toggleNavigationExpanded={toggleNavigationExpanded}
              />
            ) : (
              <AppBar className="item-enter" color="primary" position="fixed">
                <Toolbar 
                sx={{ mx: { xs: -0.75, sm: -1.5 } }} 
                className="justify-between nowrap w-full">
                    <Flex>
                      <MenuIon
                        hideNavigation={hideNavigation}
                        showBack={!!showBackIcon}
                        isExpanded={isNavigationExpanded}
                        toggleNavigationExpanded={toggleNavigationExpanded}
                        navigation={navigation}
                      />

                      {slots?.appTitle ? (
                        <slots.appTitle {...slotProps?.appTitle} />
                      ) : (
                        /* Hierarchy of application of `branding`
                         * 1. Branding prop passed in the `slotProps.appTitle`
                         * 2. Branding prop passed to the `AppLayout`
                         * 3. Branding prop passed to the `AppProvider`
                         */
                        <AppTitle {...slotProps?.appTitle} />
                      )}
                    </Flex>
                    <Flex items="center" ml="auto">
                      {ToolbarActionsSlot && (
                        <ToolbarActionsSlot {...slotProps?.toolbarActions} />
                      )}
                      {ToolbarAccountSlot && (
                        <ToolbarAccountSlot {...slotProps?.toolbarAccount} />
                      )}
                    </Flex>
                </Toolbar>
              </AppBar>
            )}
          </HideOnScroll>
        </Box>

        <Flex
          direction="column"
          flex="1"
          justify="center"
          minWidth={0}
          width="100%"
          overflow="hidden"
        >
          {!hideNavigation ? (
            <React.Fragment>
              {smDown || (!mdUp && mdDown && !miniSidebar) ? (
                <Drawer
                  container={layoutRef.current as any}
                  variant="temporary"
                  open={isNavigationExpanded}
                  onClose={handleSetNavigationExpanded(false)}
                  keepMounted={true}
                  panelProps={{
                    "data-panel": "Temporary",
                    fill: true,
                    className: drawerClasses.panel,
                  }}
                  strategy="fixed"
                  sx={{
                    ...getDrawerSharedSx(false, true),
                  }}
                >
                  {getDrawerContent(false, "phone")}
                </Drawer>
              ) : null}
            </React.Fragment>
          ) : null}
          <Flex
            width="100%"
            flex="1"
            items="stretch"
            height="max-content"
            overflow="hidden"
          >
            {smUp && !hideNavigation && (
              <Drawer
                variant="permanent"
                sx={{
                  ...getDrawerSharedSx(isMini, false),
                }}
                panelProps={{
                  "data-panel": "Permanent",
                  fill: true,
                  className: drawerClasses.panel,
                }}
              >
                {getDrawerContent(isMini, mdDown ? "tablet" : "desktop")}
              </Drawer>
            )}
            <Flex
              component="main"
              direction="column"
              //padding={4}
              flex="1"
              minWidth={0}
              overflow={hasScrollerRef ? "hidden" : "hidden auto"}
              ref={!hasScrollerRef ? contentRef : undefined}
              minHeight="100vh"
              sx={{
                perspective: 1200,
              }}
            >
              <Toolbar />
              {children}
            </Flex>
          </Flex>
          {/*
        <BottomNavigation sx={{ visibility: "hidden" }}>
          <BottomNavigationAction icon={<HomeIcon />} label="Home" />
        </BottomNavigation>
        */}
        </Flex>
        {BottomNavigationSlot && (
          <HideOnScroll
            target={contentRef.current}
            direction="up"
            enabled={hideBottomOnScroll}
          >
            <Panel
              square
              elevation={3}
              fill
              sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
            >
              <BottomNavigationSlot />
            </Panel>
          </HideOnScroll>
        )}
      </Box>
    </LayoutContext.Provider>
  );
}

export { AppLayout };
