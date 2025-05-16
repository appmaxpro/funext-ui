"use client";
import * as React from "react";
import {
  styled,
  useTheme,
  type SxProps,
  Box,
  Flex,
  Drawer,
  drawerClasses,
  IconButton,
  Tooltip,
  Text,
  Link,
  BottomNavigation,
  BottomNavigationAction,
  useScreenSize,
  Panel,
  Slide,
  Presence,
  type BottomNavigationProps,
} from "@funext/ui";

import MenuOpenIcon from "@funext/icons/MenuOpen";
import MenuIcon from "@funext/icons/Menu";
import PersonIcon from "@funext/icons/Person";
import HomeIcon from "@funext/icons/Home";
import SettingsIcon from "@funext/icons/Settings";

import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from "../../utils/ui";
import { AppBar, Toolbar } from "../other/toolbar";
import useScrollTrigger from "../../hooks/use-scroll-trigger";
import { HideOnScroll } from "~/components/other/hide-on-scroll";
import { RouteContext } from "~/context";
import { NavigationSidebar } from "~/components/sidebar/navigation-sidebar";
import type { OutletRoute, Routes } from "~/utils/types";
import { Account, type AccountProps } from "~/components/account/account";
import { AppTitle, type AppTitleProps } from "~/components/app/app-title";
import { ToolbarActions } from "./toolbar-actions";

export interface SidebarFooterProps {
  mini: boolean;
}

export interface AppLayoutSlotProps {
  appTitle?: AppTitleProps;
  toolbarActions?: {};
  toolbarAccount?: AccountProps;
  sidebarFooter?: SidebarFooterProps;
  bottomNavigation?: BottomNavigationProps;
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
  toolbarActions?: React.JSXElementConstructor<{}>;
  /**
   * The toolbar account component used in the layout header.
   * @default Account
   */
  toolbarAccount?: React.JSXElementConstructor<AccountProps>;
  /**
   * Optional footer component used in the layout sidebar.
   * @default null
   */
  sidebarFooter?: React.JSXElementConstructor<SidebarFooterProps>;

  bottomNavigation?: React.JSXElementConstructor<BottomNavigationProps>;
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
  routes?: Routes;
  /**
   * Whether the sidebar should not be collapsible to a mini variant in desktop and tablet viewports.
   * @default false
   */
  disableCollapsibleSidebar?: boolean;
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

  hideOnScrollTop?: boolean;
  hideOnScrollBottom?: boolean;
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
    children,
    disableCollapsibleSidebar = false,
    defaultSidebarCollapsed = false,
    hideNavigation = false,
    sidebarExpandedWidth = 320,
    renderPageItem,
    slots,
    slotProps,
    sx,
    hideOnScrollTop,
    hideOnScrollBottom,
    routes,
  } = props;

  const theme = useTheme();

  const navigationContext = React.useContext(RouteContext);
  const navigation = routes ?? navigationContext;
  const appWindowContext: any = null;

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

  const [isNavigationExpanded, setIsNavigationExpanded] = React.useState(
    mdDown ? false : !defaultSidebarCollapsed,
  );

  const [isNavigationFullyExpanded, setIsNavigationFullyExpanded] =
    React.useState(isNavigationExpanded);

  const [isNavigationFullyCollapsed, setIsNavigationFullyCollapsed] =
    React.useState(!isNavigationExpanded);

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
    setIsNavigationExpanded(!isNavigationExpanded);
  }, [isNavigationExpanded, setIsNavigationExpanded]);

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

  const isMini = !disableCollapsibleSidebar && !isNavigationExpanded;

  const contentRef = React.useRef<Node | null>(null);

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => {
      const expandMenuActionText = "Expand";
      const collapseMenuActionText = "Collapse";

      return (
        <Tooltip
          content={`${isExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
          hoverProps={{
            delay: {
              open: 1000,
              close: 0,
            },
          }}
        >
          <IconButton
            aria-label={`${isExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
            onClick={toggleNavigationExpanded}
          >
            {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      );
    },
    [toggleNavigationExpanded],
  );

  const hasDrawerTransitions = smUp && (disableCollapsibleSidebar || !mdDown);

  const ToolbarActionsSlot = slots?.toolbarActions ?? ToolbarActions;
  const ToolbarAccountSlot = slots?.toolbarAccount ?? Account;
  const SidebarFooterSlot = slots?.sidebarFooter ?? null;
  const BottomNavigationSlot = slots?.bottomNavigation ?? null;

  const getDrawerContent = React.useCallback(
    (isMini: boolean, viewport: "phone" | "tablet" | "desktop") => (
      <React.Fragment>
        <Box height="100px" />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "auto",
            pt: /*navigationContext[0]?.kind === 'header' &&*/ !isMini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isNavigationFullyExpanded, "padding")
              : {}),
          }}
        >
          <NavigationSidebar
            subNavigation={navigation}
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
      //navigationContext,
      slotProps?.sidebarFooter,
    ],
  );

  const getDrawerSharedSx = React.useCallback(
    (isMini: boolean, isTemporary: boolean) => {
      const drawerWidth = isMini ? 64 : sidebarExpandedWidth;

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
    <Box
      ref={layoutRef}
      sx={{
        position: "relative",
        display: "flex",
        overflow: "hidden",
        height: "100vh",
        width: "100%",
        flexDirection: "column",
        ...sx,
      }}
      data-screen-current={current}
      data-screen-width={`${width}`}
      data-xs-down={`${xsDown}`}
      data-sm-down={`${smDown}`}
      data-md-down={`${mdDown}`}
    >
      <HideOnScroll
        target={contentRef.current}
        direction="down"
        enabled={hideOnScrollTop}
      >
        <AppBar className="item-enter" color="primary" position="fixed">
          <Toolbar sx={{ mx: { xs: -0.75, sm: -1.5 } }}>
            <Box
              display="flex"
              justify="space-between"
              items="center"
              sx={{
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <Box display="flex">
                {!hideNavigation ? (
                  <Box sx={{ mr: 1 }}>{getMenuIcon(isNavigationExpanded)}</Box>
                ) : null}
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
              </Box>
              <Flex
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ marginLeft: "auto" }}
              >
                <ToolbarActionsSlot {...slotProps?.toolbarActions} />
                <ToolbarAccountSlot {...slotProps?.toolbarAccount} />
              </Flex>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          width: "100%",
          pb: 7,
          overflowY: "auto",
        }}
        ref={contentRef}
      >
        <Toolbar />
        {!hideNavigation ? (
          <React.Fragment>
            {smDown || (!mdUp && mdDown && disableCollapsibleSidebar) ? (
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
                backdrop={smDown ? {} : undefined}
                sx={{
                  ...getDrawerSharedSx(false, true),
                }}
              >
                {getDrawerContent(false, "phone")}
              </Drawer>
            ) : null}
          </React.Fragment>
        ) : null}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flex: 1,

            width: "100%",
            alignItems: "stretch",
            height: "max-content",
          }}
        >
          {smUp && (
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
          <Box
            component="main"
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
              overflow: "auto",
              justifyContent: "center",
              padding: 4,
            }}
          >
            {children}
          </Box>
        </Box>
        {/*
        <BottomNavigation sx={{ visibility: "hidden" }}>
          <BottomNavigationAction icon={<HomeIcon />} label="Home" />
        </BottomNavigation>
        */}
      </Box>
      {BottomNavigationSlot && (
        <HideOnScroll
          target={contentRef.current}
          direction="up"
          enabled={hideOnScrollBottom}
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
  );
}

export { AppLayout };
