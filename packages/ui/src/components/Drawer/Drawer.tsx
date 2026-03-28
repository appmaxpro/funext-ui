"use client";
import * as React from "react";

import {
  clsx,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxThemeProps,
  useMuxDefaultProps,
  useRtl,
  useTheme
} from "../../styles";

import rootShouldForwardProp from "../../styles/rootShouldForwardProp";

import { StandardProps } from "../../theme/tw/props";
import { capitalize, isElement } from "../../utils";

import {
  OpenChangeReason
} from "@floating-ui/react";
import { TransitionProps } from "react-transition-group/Transition";
import { useForwardedRef } from "../../hooks";
import { Slide, SlideProps } from "../../lib/transitions/slide";
import Dialog, { DialogProps, dialogClasses } from "../Dialog";
import { getAnimationOrName } from "../internal/animation";
import Panel, { PanelProps } from "../Panel";
import { PopperProps } from "../Popper";

export interface DrawerClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `variant="permanent or persistent"`. */
  docked: string;
  /** Styles applied to the Panel component. */
  panel: string;
  /** Styles applied to the Panel component if `direction="start"`. */
  panelDirectionStart: string;
  /** Styles applied to the Panel component if `direction="end"`. */
  panelDirectionEnd: string;
  /** Styles applied to the Panel component if `direction="top"`. */
  panelDirectionTop: string;
  /** Styles applied to the Panel component if `direction="bottom"`. */
  panelDirectionBottom: string;
  /** Styles applied to the Panel component if `direction="start"` and `variant` is not "temporary". */
  panelDirectionDockedStart: string;
  /** Styles applied to the Panel component if `direction="top"` and `variant` is not "temporary". */
  panelDirectionDockedTop: string;
  /** Styles applied to the Panel component if `direction="end"` and `variant` is not "temporary". */
  panelDirectionDockedEnd: string;
  /** Styles applied to the Panel component if `direction="bottom"` and `variant` is not "temporary". */
  panelDirectionDockedBottom: string;
  /** Styles applied to the Popper component. */
  modal: string;
}

export type DrawerClassKey = keyof DrawerClasses;

export function getDrawerUtilityClass(slot: string): string {
  return generateUtilityClass("MuxDrawer", slot);
}

export const drawerClasses: DrawerClasses = generateUtilityClasses(
  "MuxDrawer",
  [
    "root",
    "container",
    "docked",
    "panel",
    "panelDirectionStart",
    "panelDirectionEnd",
    "panelDirectionTop",
    "panelDirectionBottom",
    "panelDirectionDockedStart",
    "panelDirectionDockedEnd",
    "panelDirectionDockedTop",
    "panelDirectionDockedBottom",
    "modal",
  ],
);

const overridesResolver = (props: any, styles: any) => {
  const { ownerState } = props;

  return [
    styles.root,
    (ownerState.variant === "permanent" ||
      ownerState.variant === "persistent") &&
      styles.docked,
    styles.modal,
  ];
};

const useUtilityClasses = (ownerState: any) => {
  const { classes, direction, variant } = ownerState;

  const slots = {
    root: ["root", `anchor${capitalize(direction)}`],
    docked: [(variant === "permanent" || variant === "persistent") && "docked"],
    modal: ["modal"],
    container: ["container", `containerDirection${capitalize(direction)}`],
    panel: [
      "panel",
      `panelDirection${capitalize(direction)}`,
      variant !== "temporary" && `panelDirectionDocked${capitalize(direction)}`,
    ],
  };

  return composeClasses(slots, getDrawerUtilityClass, classes);
};

const DrawerRoot = styled(Dialog, {
  name: "MuxDrawer",
  slot: "Root",
  overridesResolver: (props: any, styles: any) => [styles.root]
})('');


const DrawerContainer = styled('div', {
  name: "MuxDrawer",
  slot: "Container",
  overridesResolver: (props: any, styles: any) => {  
    return [
      styles.root,
      styles.container,
    ];
  }
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.drawer,
    height: '100%',
    // We disable the focus ring for mouse, touch and keyboard users.
    outline: 0,
    variants: [
      {
        style: ({ ownerState }: any) => ({
          position: ownerState.fullScreen ? 'relative' : ownerState?.strategy,
        }),
      },
      {
        props: {
          direction: "start",
        },
        style: {
          left: 0,
          top: 0,
          bottom: 0,
        },
      },
      {
        props: {
          direction: "end",
        },
        style: {
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
      {
        props: {
          direction: "top",
        },
        style: {
          top: 0,
          left: 0,
          right: 0,
        },
      },
      {
        props: {
          direction: "bottom",
        },
        style: {
          left: 0,
          bottom: 0,
          right: 0,
        },
      },
    ],
  })),
);

const DrawerDockedRoot = styled("div", {
  shouldForwardProp: rootShouldForwardProp,
  name: "MuxDrawer",
  slot: "Docked",
  skipVariantsResolver: false,
  overridesResolver,
})({
  flex: "0 0 auto",
});

const DrawerPanel = styled(Panel, {
  name: "MuxDrawer",
  slot: "Panel",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.panel,
      styles[`panelDirection${capitalize(ownerState.direction)}`],
      ownerState.variant !== "temporary" &&
        styles[`panelDirectionDocked${capitalize(ownerState.direction)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    //height: "100%",
    flex: "1 0 auto",
    // Add iOS momentum scrolling for iOS < 13.0
    WebkitOverflowScrolling: "touch",
    position: "relative",
    // We disable the focus ring for mouse, touch and keyboard users.
    // At some point, it would be better to keep it for keyboard users.
    // :focus-ring CSS pseudo-class will help.
    outline: 0,
    [`&:has(>.${dialogClasses.dialogBody})`]: {
      overflow: "hidden",
      maxWidth: '100%',
      maxHeight: '100%'
    },
    variants: [
      {
        props: {
          fullScreen: true,
          variant: "temporary"
        },
        style: {
          width: '100%',
          height: '100%',
        },
      },
      {
        props: ({ ownerState }: any) =>
          ownerState.fullScreen &&
          ownerState.direction === "start" ||
          ownerState.direction === "end",
        style: {
          height: '100%',
          
        },
      },
      {
        props: ({ ownerState }: any) =>
          ownerState.fullScreen &&
          ownerState.direction === "top" ||
          ownerState.direction === "bottom",
        style: {
          width: '100%',
        },
      },
      {
        props: ({ ownerState }: any) =>
          ownerState.direction === "start" &&
          ownerState.variant !== "temporary",
        style: {
          borderRightWidth: 1,
        },
      },
      {
        props: ({ ownerState }: any) =>
          ownerState.direction === "top" && ownerState.variant !== "temporary",
        style: {
          borderBottomWidth: 1,
        },
      },
      {
        props: ({ ownerState }: any) =>
          ownerState.direction === "end" && ownerState.variant !== "temporary",
        style: {
          borderLeftWidth: 1,
        },
      },
      {
        props: ({ ownerState }: any) =>
          ownerState.direction === "bottom" &&
          ownerState.variant !== "temporary",
        style: {
          borderTopWidth: 1,
        },
      },
    ],
  })),
  getAnimationOrName('slideFadeIn')
);

const oppositeDirection: any = {
  start: "end",
  end: "start",
  top: "down",
  bottom: "up",
};

export function isHorizontal(direction: string) {
  return ["start", "end"].includes(direction);
}

export function getDirection(direction: string, isRtl: boolean) {
  return isRtl && isHorizontal(direction)
    ? oppositeDirection[direction]
    : direction;
}

export type onClose = (event?: Event, reason?: OpenChangeReason) => void;

export interface DrawerProps
  extends StandardProps<DialogProps, DrawerClassKey, "placement" | "handler"> {
  /**
   * Side from which the drawer will appear.
   * @default 'start'
   */
  direction?: "start" | "top" | "end" | "bottom";
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DrawerClasses>;
  /**
   * The elevation of the drawer.
   * @default 16
   */
  elevation?: number;
  /**
   * Props applied to the [`Popper`](https://mui.com/material-ui/api/modal/) element.
   * @default {}
   */
  popperProps?: Partial<PopperProps>;
  /**
   * Callback fired when the component requests to be closed.
   * The `reason` parameter can optionally be used to control the response to `onClose`.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose?: onClose;
  /**
   * Props applied to the [`Panel`](https://mui.com/material-ui/api/panel/) element.
   * @default {}
   */
  panelProps?: Partial<PanelProps<React.ElementType>>;
  /**
   * Props applied to the [`Slide`](https://mui.com/material-ui/api/slide/) element.
   */
  slideProps?: Partial<SlideProps>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default {
   *   enter: theme.transitions.duration.enteringScreen,
   *   exit: theme.transitions.duration.leavingScreen,
   * }
   */
  transitionDuration?: TransitionProps["timeout"];
  /**
   * The variant to use.
   * @default 'temporary'
   */
  variant?: "permanent" | "persistent" | "temporary";

  container?:
    | HTMLElement
    | null
    | undefined
    | (() => HTMLElement | null | undefined);
}

/**
 * The props of the [Popper](/material-ui/api/modal/) component are available
 * when `variant="temporary"` is set.
 */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(inProps, ref) {
    const props = useMuxDefaultProps({ props: inProps, name: "MuxDrawer" });
    const theme = useTheme();
    const isRtl = useRtl();
    const defaultTransitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    };

    const {
      direction = "start",
      children,
      className,
      elevation = 16,
      open = false,
      panelProps = {},
      slideProps,
      popperProps,
      // eslint-disable-next-line react/prop-types
      //TransitionComponent = Slide,
      transitionDuration = defaultTransitionDuration,
      variant = "temporary",
      strategy = "absolute",
      style,
      root,
      container = isElement(root) ? root : root?.current,
      onClose,
      ...other
    } = props;

    const TransitionComponent = Slide;
    // Let's assume that the Drawer will always be rendered on user space.
    // We use this state is order to skip the appear transition during the
    // initial mount of the component.
    const mounted = React.useRef(false);
    React.useEffect(() => {
      mounted.current = true;
    }, []);


    const ownerDirection = getDirection(direction, isRtl);

    //console.log("Drawer:render");
    const ownerState = {
      ...props,
      direction,
      elevation,
      open,
      variant,
      strategy,
      ...other,
    };

    const classes = useUtilityClasses(ownerState);

    const drawerRef = useForwardedRef(ref);

    const zOffset = useTheme().zIndex.drawer;

    const drawer = variant === "permanent" || variant === "persistent" ? (
      <DrawerPanel
        elevation={0}
        square
        {...(panelProps as any)}
        className={clsx(classes.panel, panelProps.className)}
        ownerState={ownerState}
      >
        {children}
      </DrawerPanel>
    ) : undefined;

    if (variant === "permanent") {
      return (
        <DrawerDockedRoot
          className={clsx(classes.root, classes.docked, className)}
          ownerState={ownerState}
          {...other}
          style={style}
          ref={drawerRef}
        >
          {drawer}
        </DrawerDockedRoot>
      );
    }

    

    if (variant === "persistent") {
      return (
        <DrawerDockedRoot
          className={clsx(classes.root, classes.docked, className)}
          ownerState={ownerState}
          ref={drawerRef as any}
          {...other}
        >
          
      {/* @ts-ignore*/}
      <TransitionComponent
        in={open}
        direction={
          direction === "top"
            ? "down"
            : direction === "bottom"
              ? "up"
              : direction === "start"
                ? "end"
                : "start"
        }
        timeout={transitionDuration}
        appear={mounted.current}
        //temporary={variant === "temporary"}
        onEntered={() => {
          //setOpenState(true);
          //console.log("Drawer:OpenState");
        }}
        onExited={() => {
          //setOpenState(false);
          //console.log("Drawer:CloseState");
        }}
        container={
          container ?? drawerRef.current
        }
        {...slideProps}
      >
        {drawer}
      </TransitionComponent>
        </DrawerDockedRoot>
      );
    }
    
    const side = direction === "start"
    ? "left"
    : direction === "end"
      ? "right"
      : direction == 'top'
      ? 'bottom' : 'top';

    // variant === temporary
    return (
      <DrawerRoot
        data-ui="Drawer"
        Container={DrawerContainer}
        containerProps={{ownerState , style}}
        PanelComponent={DrawerPanel}
        onClose={onClose}
        panelProps={{
          square: true,
          fill:true,
          ...(panelProps as any),
          className:clsx(classes.panel, panelProps.className),
          'data-side': side,
          ownerState
        }}
        {...other}
        className={className}
        open={open}
        root={container}
        strategy={strategy}
        animation={{
          animate: true,
          animation: 'slideFadeIn'
        }}
        ref={ref}
      >
          {children}
      </DrawerRoot>
      
    );
  },
);


export default Drawer;
