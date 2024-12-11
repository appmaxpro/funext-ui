"use client";
import * as React from "react";
import { styled, useTheme, SxProps } from "../../../styles";
import MuiAppBar from "../../Navbar";
import { SxBox as Box, SxBox } from "../../Box";
import Drawer, {drawerClasses} from "../Drawer";
import IconButton from "../../IconButton";
import Tooltip from "../../Tooltip";
import Text from "../../Text";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { Link } from "../../Link";
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from "./utils";
import { MaterialIcon } from "../../../../icons/material-icon";
import { Logo } from "./logo";
import { useScreenSize } from "../../Screen";

const AppBar = styled(SxBox)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: "none",
  zIndex: theme.zIndex.drawer + 1,
  height: "48px",
  width: '100%',
  padding: '0 16px'
}));

const LogoContainer = styled("div")({
  position: "relative",
  height: 40,
  "& img": {
    maxHeight: 40,
  },
});

export interface SidebarFooterProps {
  mini: boolean;
}

export interface DashboardLayoutSlotProps {
  toolbarActions?: {};
  sidebarFooter?: SidebarFooterProps;
}

export interface DashboardLayoutSlots {
  /**
   * The toolbar actions component used in the layout header.
   * @default ToolbarActions
   */
  toolbarActions?: React.JSXElementConstructor<{}>;
  /**
   * Optional footer component used in the layout sidebar.
   * @default null
   */
  sidebarFooter?: React.JSXElementConstructor<SidebarFooterProps>;
}

export interface DashboardLayoutProps {
  /**
   * The content of the dashboard.
   */
  children: React.ReactNode;
  /**
   * Branding options for the dashboard.
   * @default null
   */
  branding?: React.ReactNode | null;
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
   * The components used for each slot inside.
   * @default {}
   */
  slots?: DashboardLayoutSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: DashboardLayoutSlotProps;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps;
}

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [DashboardLayout API](https://mui.com/toolpad/core/api/dashboard-layout)
 */
function DashboardLayout(props: DashboardLayoutProps) {
  const {
    children,
    disableCollapsibleSidebar = false,
    defaultSidebarCollapsed = false,
    hideNavigation = false,
    sidebarExpandedWidth = 320,
    slots,
    slotProps,
    sx,
  } = props;

  const theme = useTheme();

  //const navigationContext = React.useContext(NavigationContext);
  const appWindowContext: any = null;

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] =
    React.useState(!defaultSidebarCollapsed);

  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] =
    React.useState(false);

  const {mdDown:isUnderMdViewport, smUp:isOverSmViewport} = useScreenSize()

  //const isUnderMdViewport = useMediaQuery(theme.breakpoints.down("md"));
  // isOverSmViewport = useMediaQuery(theme.breakpoints.up("sm"));

  const isNavigationExpanded = isUnderMdViewport
    ? isMobileNavigationExpanded
    : isDesktopNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => {
      if (isUnderMdViewport) {
        setIsMobileNavigationExpanded(newExpanded);
      } else {
        setIsDesktopNavigationExpanded(newExpanded);
      }
    },
    [isUnderMdViewport],
  );

  const [isNavigationFullyExpanded, setIsNavigationFullyExpanded] =
    React.useState(isNavigationExpanded);

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
    setIsMobileNavigationExpanded(false);
  }, [setIsMobileNavigationExpanded]);

  // If useEffect was used, the reset would also happen on the client render after SSR which we don't need
  /*
  React.useMemo(() => {
    if (navigationContext) {
      selectedItemIdRef.current = '';
    }
  }, [navigationContext]);*/

  const isDesktopMini =
    !disableCollapsibleSidebar && !isDesktopNavigationExpanded;
  const isMobileMini =
    !disableCollapsibleSidebar && !isMobileNavigationExpanded;

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => {
      const expandMenuActionText = "Expand";
      const collapseMenuActionText = "Collapse";

      return (
        <Tooltip
          content={`${isExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
          hoverProps={{
            delay:{
              open: 1000,
              close: 0
            }
          }}
        >
          <div>
            <IconButton
              aria-label={`${isExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
              onClick={toggleNavigationExpanded}
            >
              {isExpanded ? (
                <MaterialIcon icon="menu_open" />
              ) : (
                <MaterialIcon icon="menu" />
              )}
            </IconButton>
          </div>
        </Tooltip>
      );
    },
    [toggleNavigationExpanded],
  );

  const hasDrawerTransitions =
    isOverSmViewport && (disableCollapsibleSidebar || !isUnderMdViewport);

  const SidebarFooterSlot = slots?.sidebarFooter ?? null;

  const getDrawerContent = React.useCallback(
    (isMini: boolean, viewport: "phone" | "tablet" | "desktop") => (
      <React.Fragment>
        <Box height="100px"/>
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
          <span>
            Drawer
          </span>
          {/*
          <DashboardSidebarSubNavigation
            subNavigation={navigationContext}
            onLinkClick={handleNavigationLinkClick}
            isMini={isMini}
            isFullyExpanded={isNavigationFullyExpanded}
            hasDrawerTransitions={hasDrawerTransitions}
            selectedItemId={selectedItemIdRef.current}
          />
          {SidebarFooterSlot ? (
            <SidebarFooterSlot mini={isMini} {...slotProps?.sidebarFooter} />
          ) : null}
           */}
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
        ...(isTemporary ? { position: "absolute" } : {}),
        [`& .${drawerClasses.panel}`]: {
          position: "absolute",
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
        ...sx,
      }}
    >
      <AppBar color="inherit" position="absolute">
        <Box
          display="flex"
          width="100%"
          sx={{ backgroundColor: "inherit", mx: { xs: -0.75, sm: -1.5 } }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Box display="flex">
              {!hideNavigation ? (
                <React.Fragment>
                  <Box
                    sx={{
                      mr: { sm: disableCollapsibleSidebar ? 0 : 1 },
                      display: { md: "none" },
                    }}
                  >
                    {getMenuIcon(isMobileNavigationExpanded)}
                  </Box>
                  <Box
                    sx={{
                      display: {
                        xs: "none",
                        md: disableCollapsibleSidebar ? "none" : "block",
                      },
                      mr: disableCollapsibleSidebar ? 0 : 1,
                    }}
                  >
                    {getMenuIcon(isDesktopNavigationExpanded)}
                  </Box>
                </React.Fragment>
              ) : null}
              <Link
                href="/"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Box display="flex" alignItems="center">
                  <LogoContainer>
                    <Logo/>
                  </LogoContainer>
                  <Text
                    variant="h6"
                    sx={{
                      color: (theme.vars ?? theme).palette.primary.main,
                      fontWeight: "700",
                      ml: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <h6 className="MuxText-root MuxText-h6 iframe-demo-ltr-sue4hn">Toolpad</h6>
                  </Text>
                </Box>
              </Link>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              spacing={1}
              sx={{ marginLeft: "auto" }}
            >
              "Account tool bar"
            </Box>
          </Box>
        </Box>
      </AppBar>

      {!hideNavigation ? (
        <React.Fragment>
          <Drawer
            container={layoutRef.current as any}
            variant="temporary"
            open={isMobileNavigationExpanded}
            onClose={handleSetNavigationExpanded(false)}
            keepMounted={true}
            panelProps={{
              'data-panel': "Drawer1",
              fill: true,
              className: drawerClasses.panel
            }}
            sx={{
              display: {
                xs: "block",
                sm: disableCollapsibleSidebar ? "block" : "none",
                md: "none",
              },
              ...getDrawerSharedSx(false, true),
            }}
          >
            {getDrawerContent(false, "phone")}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: {
                xs: "none",
                sm: disableCollapsibleSidebar ? "none" : "block",
                md: "none",
              },
              ...getDrawerSharedSx(isMobileMini, false),
            }}
            panelProps={{
              'data-panel': "Drawer2",
              fill: true,
              className: drawerClasses.panel
            }}
          >
            {getDrawerContent(isMobileMini, "tablet")}

          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              ...getDrawerSharedSx(isDesktopMini, false),
            }}
            panelProps={{
              'data-panel': "Drawer3",
              fill: true,
              className: drawerClasses.panel
            }}
          >
            {getDrawerContent(isDesktopMini, "desktop")}
          </Drawer>
        </React.Fragment>
      ) : null}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box height={"48px"} />
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
            justifyContent: 'center'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export { DashboardLayout };
