"use client";
import * as React from "react";
import {
  type SxProps,
  Box,
  Flex,
  useScreenSize,
  Panel,
  type BottomNavigationProps,
  Stack,
} from "~/ui";

import { AppBar, Toolbar } from "../shared/toolbar";
import { HideOnScroll } from "~/components/shared/hide-on-scroll";
import { LayoutContext } from "~/context";
import { AppTitle, type AppTitleProps } from "~/components/app/app-title";
import { MemoAppBottomNavigation } from "./app-bottom-navigation";

export interface RawAppLayoutSlots {
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

  bottomNavigation?: React.ComponentType<BottomNavigationProps>;
}

export interface RawAppLayoutSlotProps {
  appTitle?: AppTitleProps;
  toolbarActions?: {};
  bottomNavigation?: BottomNavigationProps;
  appBar?: React.ComponentProps<typeof AppBar>;
}

export interface RawAppLayoutProps {
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
   * The components used for each slot inside.
   * @default {}
   */
  slots?: RawAppLayoutSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: RawAppLayoutSlotProps;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps;
  appBar?: React.ComponentType<any>;
  hideTopOnScroll?: boolean;
  hideBottomOnScroll?: boolean;
  showBackIcon?: boolean;
  showBottomNav?: boolean;
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
function RawAppLayout(props: RawAppLayoutProps) {
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
    slots,
    slotProps,
    sx,
    hideTopOnScroll = true,
    hideBottomOnScroll,
    showBackIcon = true,
    showBottomNav,
    appBar,
  } = props;

  const contentRef = React.useRef<Node | null>(null);

  const [hasScrollerRef, setHasScrollerRef] =
    React.useState<HTMLElement | null>(null);
  const setScrollerRef = React.useCallback(
    (ref: HTMLElement | null) => {
      contentRef.current = ref;
      setHasScrollerRef(ref);
    },
    [setHasScrollerRef],
  );

  const AppBarExt = appBar;
  const ToolbarActionsSlot = slots?.toolbarActions; //?? ToolbarActions;
  const BottomNavigationSlot =
    slots?.bottomNavigation ??
    (showBottomNav && smDown ? MemoAppBottomNavigation : null);

  const layoutRef = React.useRef<Element | null>(null);

  return (
    <LayoutContext.Provider
      value={React.useMemo(() => ({ setScrollerRef }), [setScrollerRef])}
    >
      <Stack
        ref={layoutRef}
        className="parent-view"
        position="relative"
        width="100%"
        sx={sx}
        data-ui="RawAppLayout"
        data-screen-current={current}
        data-screen-width={`${width}`}
        data-xs-down={`${xsDown}`}
        data-sm-down={`${smDown}`}
        data-md-down={`${mdDown}`}
      >
        <Box data-ui="AppBarRoot">
          <HideOnScroll
            target={hasScrollerRef}
            direction="down"
            enabled={hideTopOnScroll}
            key={hasScrollerRef ? "hasScrollerRef" : undefined}
          >
            
              {AppBarExt ? (
                <AppBarExt />
              ) : (
                <AppBar className="item-enter" color="primary" position="fixed">
                  <Toolbar
                    sx={{ mx: { xs: -0.75, sm: -1.5 } }}
                    className="justify-between nowrap w-full"
                  >
                    <Flex>
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
                    </Flex>
                  </Toolbar>
                </AppBar>
              )}
          </HideOnScroll>
        </Box>

        <Stack
          component="main"
          data-ui="ContentRoot"
          flex="1"
          minWidth={0}
          overflow={hasScrollerRef ? "hidden" : "hidden auto"}
          ref={!hasScrollerRef ? contentRef : undefined}
          sx={{
            perspective: 1200,
          }}
        >
          {!hasScrollerRef && <Toolbar />}
          {children}
        </Stack>
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
      </Stack>
    </LayoutContext.Provider>
  );
}

export { RawAppLayout };
