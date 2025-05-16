import React, { useContext, useEffect, useMemo } from "react";
//import { css } from "@emotion/react";

// @floating-ui
import {
  useFloating,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
  useId,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useMergeRefs,
  FloatingFocusManagerProps,
  FloatingTree,
  FloatingContext,
} from "@floating-ui/react";

// types

import type { DismissProps, handler } from "../Popper/types";

// dialog components
import { DialogHeader, DialogHeaderProps } from "./DialogHeader";
import { DialogBody, DialogBodyProps } from "./DialogBody";
import { DialogFooter, DialogFooterProps } from "./DialogFooter";

import {
  Breakpoint,
  clsx,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  StyledComponent,
  SxThemeProps,
  useMuxDefaultProps,
  useTheme,
  css,
  type SxComponentProps,
} from "../../styles";
import { capitalize, isElement } from "../../utils";
import Panel, { PanelProps } from "../Panel";
import { MuxFloatingProvider, useFloatingContext } from "../Context";
import { Presence } from "../../lib/presence";
import { Layer, LayerProps, LayerProvider, useLayer } from "../../lib/layer";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { Portal, PortalProps } from "../../lib/portal";
import OverlayComp, { OverlayProps } from "../Overlay";
import { useRefs } from "../../hooks";
import { EMPTY_RECORD } from "../../lib/constants";
import {
  AnimatableProps,
  AnimatedProps,
  EMPTY_STYLES,
  getAnimation,
  getAnimationData,
  getAnimationOr,
  getAnimationOrName,
  getAnimationStyles,
  shouldForwardProp,
} from "../internal/animation";
import { isRecord } from "../../lib/isRecord";
import { onOpenChangeEvent } from "../../lib/openChangeEvent";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";

export interface DialogClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the container element if `scroll="panel"`. */
  scrollPanel: string;
  /** Styles applied to the container element if `scroll="body"`. */
  scrollBody: string;
  /** Styles applied to the container element. */
  container: string;
  /** Styles applied to the Panel component. */
  panel: string;
  /** Styles applied to the Panel component if `scroll="panel"`. */
  panelScrollPanel: string;
  /** Styles applied to the Panel component if `scroll="body"`. */
  panelScrollBody: string;
  /** Styles applied to the Panel component if `maxWidth=false`. */
  panelSizeFalse: string;
  /** Styles applied to the Panel component if `maxWidth="xs"`. */
  panelSizeXs: string;
  /** Styles applied to the Panel component if `maxWidth="sm"`. */
  panelSizeSm: string;
  /** Styles applied to the Panel component if `maxWidth="md"`. */
  panelSizeMd: string;
  /** Styles applied to the Panel component if `maxWidth="lg"`. */
  panelSizeLg: string;
  /** Styles applied to the Panel component if `maxWidth="xl"`. */
  panelSizeXl: string;
  /** Styles applied to the Panel component if `fullWidth={true}`. */
  panelFullWidth: string;
  /** Styles applied to the Panel component if `fullScreen={true}`. */
  panelFullScreen: string;
}

export type DialogClassKey = keyof DialogClasses;

export function getDialogUtilityClass(slot: string): string {
  return generateUtilityClass("MuxDialog", slot);
}

const dialogClasses: DialogClasses = generateUtilityClasses("MuxDialog", [
  "root",
  "scrollPanel",
  "scrollBody",
  "container",
  "panel",
  "panelScrollPanel",
  "panelScrollBody",
  "panelSizeFalse",
  "panelSizeXs",
  "panelSizeSm",
  "panelSizeMd",
  "panelSizeLg",
  "panelSizeXl",
  "panelFullWidth",
  "panelFullScreen",
]);

export { dialogClasses };

const useUtilityClasses = (ownerState: any) => {
  const { classes, scroll, size, fullWidth, fullScreen } = ownerState;

  const slots = {
    root: ["root"],
    container: ["container", `scroll${capitalize(scroll)}`],
    panel: [
      "panel",
      `panelScroll${capitalize(scroll)}`,
      `panelSize${capitalize(String(size))}`,
      fullWidth && "panelFullWidth",
      fullScreen && "panelFullScreen",
    ],
  };

  return composeClasses(slots, getDialogUtilityClass, classes);
};

/**
 * @internal
 */
export interface AnimationDialogStyleProps {
  animate?: boolean;
}

const DialogRoot = styled("div", {
  name: "MuxDialog",
  slot: "Root",
  shouldForwardProp,
  overridesResolver: (props, styles) => styles.root,
})<SxComponentProps<any>>(
  {
    //minWidth: "max-content",
    inset: 0,
  },
  () => {
    const { zIndex } = useLayer();
    return {
      zIndex: zIndex,
    };
  },
);

export const DialogContainerRoot = styled("div", {
  name: "MuxDialog",
  slot: "Container",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.container, styles[`scroll${capitalize(ownerState.scroll)}`]];
  },
  shouldForwardProp,
})({
  height: "100%",
  "@media print": {
    height: "auto",
  },
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
  variants: [
    {
      props: {
        scroll: "panel",
      },
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
    {
      props: {
        scroll: "body",
      },
      style: {
        overflowY: "auto",
        overflowX: "hidden",
        textAlign: "center",
        "&::after": {
          content: '""',
          display: "inline-block",
          verticalAlign: "middle",
          height: "100%",
          width: "0",
        },
      },
    },
  ],
});

const DialogPanel = styled(Panel, {
  name: "MuxDialog",
  slot: "Panel",
  shouldForwardProp,
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.panel,
      styles[`scrollPanel${capitalize(ownerState.scroll)}`],
      styles[`panelSize${capitalize(String(ownerState.size))}`],
      ownerState.fullWidth && styles.panelFullWidth,
      ownerState.fullScreen && styles.panelFullScreen,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    margin: 32,
    position: "relative",
    overflowY: "auto",
    transition:
      "width,height," +
      theme.transitions.create("box-shadow", {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.sharp,
      }),
    "@media print": {
      overflowY: "visible",
      boxShadow: "none",
    },

    variants: [
      {
        props: {
          scroll: "panel",
        },
        style: {
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100% - 64px)",
        },
      },
      {
        props: {
          scroll: "body",
        },
        style: {
          display: "inline-block",
          verticalAlign: "middle",
          textAlign: "initial",
        },
      },
      {
        props: ({ ownerState }: any) => !ownerState.size,
        style: {
          maxWidth: "calc(100% - 64px)",
        },
      },
      {
        props: {
          size: "xs",
        },
        style: {
          maxWidth:
            theme.breakpoints.unit === "px"
              ? Math.max(theme.breakpoints.values.xs, 444)
              : `max(${theme.breakpoints.values.xs}${theme.breakpoints.unit}, 444px)`,
          [`&.${dialogClasses.panelScrollBody}`]: {
            [theme.breakpoints.down(
              Math.max(theme.breakpoints.values.xs, 444) + 32 * 2,
            )]: {
              maxWidth: "calc(100% - 64px)",
            },
          },
        },
      },
      ...Object.keys(theme.breakpoints.values)
        .filter((size) => size !== "xs" && size !== "xxl")
        .map((size) => ({
          props: { size },
          style: {
            //@ts-ignore
            maxWidth: `${theme.breakpoints.values[size]}${theme.breakpoints.unit}`,
            [`&.${dialogClasses.panelScrollBody}`]: {
              //@ts-ignore
              [theme.breakpoints.down(theme.breakpoints.values[size] + 32 * 2)]:
                {
                  maxWidth: "calc(100% - 64px)",
                },
            },
          },
        })),
      {
        props: ({ ownerState }: any) => ownerState.fullWidth,
        style: {
          width: "calc(100% - 64px)",
        },
      },
      {
        props: ({ ownerState }: any) => ownerState.fullScreen,
        style: {
          margin: 0,
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          maxHeight: "none",
          borderRadius: "0!important",
          [`&.${dialogClasses.panelScrollBody}`]: {
            margin: 0,
            maxWidth: "100%",
          },
        },
      },
    ],
  })),
  getAnimation,
) as StyledComponent<SxComponentProps & PanelProps & AnimatedProps>;

const defaultOverlayProps = {
  visible: true,
  lockScroll: true,
};

const defaultAnimate = {
  animate: true,
  animation: "liteScaleFade",
};

const defaultPanelProps = {
  fill: true,
};

export interface DialogProps extends SxComponentProps {
  /**
   * The id(s) of the element(s) that describe the dialog.
   */
  "aria-describedby"?: string;
  /**
   * The id(s) of the element(s) that label the dialog.
   */
  "aria-labelledby"?: string;
  /**
   * Informs assistive technologies that the element is modal.
   * It's added on the element with role="dialog".
   * @default true
   */
  "aria-modal"?: boolean | "true" | "false";

  open?: boolean;
  onOpenChange?: handler;
  onClose?: ()=> void;
  dismiss?: DismissProps;
  animate?: boolean;
  animation?: AnimatedProps | boolean;
  children: React.ReactNode;
  elevation?: number;
  /**
   * The component used to render the body of the dialog.
   * @default Panel
   */
  PanelComponent?: React.ComponentType ;
  /**
   * Props applied to the [`Panel`](https://mui.com/material-ui/api/panel/) element.
   * @default {}
   */
  panelProps?: Partial<PanelProps>;

  Container?: React.ComponentType;

  containerProps?: any;

  /**
   * Determine the container for scrolling the dialog.
   * @default 'panel'
   */
  scroll?: "body" | "panel";

  /**
   * If `true`, the dialog is full-screen.
   * @default false
   */
  fullScreen?: boolean;
  /**
   * If `true`, the dialog stretches to `maxWidth`.
   *
   * Notice that the dialog width grow is limited by the default margin.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Determine the max-width of the dialog.
   * The dialog width grows with the size of the screen.
   * Set to `false` to disable `maxWidth`.
   * @default 'sm'
   */
  size?: Breakpoint | "xxl" | false;

  
  portal?: boolean;
  zOffset?: number;
  onActivate?: (props: { activeElement: HTMLElement | null }) => void;
  Overlay?: React.ComponentType<Partial<OverlayProps>>;
  overlayProps?: Partial<OverlayProps>;
  focusProps?: Omit<FloatingFocusManagerProps, "context">;
  root?: PortalProps['floatingPortal'];
  strategy?: 'absolute' | 'fixed';
}

const DialogFc = React.forwardRef<HTMLDivElement, DialogProps>(
  (inProps, ref) => {
    const props = useMuxDefaultProps({ props: inProps, name: "MuxDialog" });
    const id = useId();
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;

    let {
      "aria-describedby": ariaDescribedby = descriptionId,
      "aria-labelledby": ariaLabelledbyProp = labelId,
      "aria-modal": ariaModal = true,
      open = false,
      size,
      dismiss = {
        outsidePressEvent: "mousedown",
      },
      animate: animateProps = true,
      animation: animationProps,
      className,
      reference: target,

      backdropProps = {},
      elevation = 24,
      children,
      fullScreen = size === "xxl",
      fullWidth = fullScreen,
      PanelComponent,
      panelProps = defaultPanelProps,
      Container,
      scroll = "panel",
      onClick,
      containerProps,
      modal = true,
      portal = modal,
      zOffset,
      overlayProps = defaultOverlayProps,
      Overlay = modal ? OverlayComp : undefined,
      focusProps = modal ? { modal } : undefined,
      handler,
      onOpenChange = handler,
      onClose,
      root,
      strategy,
      ...rest
    } = props;
    const isFullScreen = fullScreen || size === "xxl";
    const isRec = isRecord(animationProps);
    const prefersReducedMotion = usePrefersReducedMotion();
    const animate = isRec && animationProps.animate !== false
      ? animationProps.animate === true || prefersReducedMotion
      : animationProps === true;

    const animation = isRec
        ? animationProps
        : animate
          ? defaultAnimate
          : undefined;


    //console.log("animation:", animation, ", animationProps:", animationProps)      
    // 2. set default props
    const ownerState = {
      ...props,
      fullScreen: isFullScreen,
      fullWidth,
      size,
      scroll,
    };

    const fnOnOpenChange =  onOpenChangeEvent({onOpenChange, onClose});

    //const useDismissRef = React.use
    // 5. set @floating-ui
    const { context } = useFloating({
      open,
      onOpenChange: fnOnOpenChange,
      strategy: strategy,
      elements: target
        ? {
            reference: isElement(target) ? target : target?.current,
          }
        : undefined,
    });

    const classes = useUtilityClasses(ownerState);

    // 7. return
    return (
      <MuxFloatingProvider type="dialog" context={context}>
        <Presence animate={animate} present={open}>
          {({ present }) => (
            <DialogPortal
              portal={!!portal}
              floatingPortal={root ?? (!!focusProps || modal)}
              present={present}
              render={(contentRef: React.ForwardedRef<HTMLDivElement>) => (
                <LayerProvider zOffset={zOffset}>
                  {(modal && Overlay && !isFullScreen) && (
                      <Overlay
                        data-ui="DialogOverlay"
                        data-animate={animate ? "" : undefined}
                        data-state={open ? "open" : "close"}
                        {...overlayProps}
                        animate={animate}
                        open={open}
                        //ref={contentRef}
                        //onClick={(event)=> context.onOpenChange(false, event)}
                      />
                  )}
                  <DialogRoot
                    {...rest}
                    style={{
                      position: context.strategy,
                      ...rest.style,
                    }}
                    className={clsx(classes.root, className)}
                    ownerState={ownerState}
                    data-ui="Dialog"
                    animate={animate}
                    ref={ref}
                  >
                    <DialogContent
                      context={context}
                      focusProps={focusProps as any}
                      animate={animate}
                      animation={animation}
                      Content={PanelComponent}
                      contentProps={{
                        elevation,
                        role: "dialog",
                        "aria-describedby": ariaDescribedby,
                        "aria-labelledby": ariaLabelledbyProp,
                        "aria-modal": ariaModal,
                        id: id,
                        fill: true,
                        ...panelProps,
                        className: clsx(classes.panel, panelProps.className),
                      }}
                      Container={Container}
                      containerProps={{
                        className: clsx(classes.container, containerProps?.className),
                        ...containerProps,
                      }}
                      modal={modal}
                      dismiss={dismiss}
                      uiOwnerState={ownerState}
                      present={present}
                      ref={contentRef}
                    >
                      {children}
                    </DialogContent>
                  </DialogRoot>

                  
                </LayerProvider>
              )}
            />
          )}
        </Presence>
      </MuxFloatingProvider>
    );
  },
);

DialogFc.displayName = "Mux.Dialog";

interface DialogPortalProps {
  portal?: boolean;
  floatingPortal?: boolean;
  present: boolean;
  render: (ref: React.ForwardedRef<HTMLDivElement>) => React.ReactNode | null;
}
const DialogPortal = React.forwardRef<HTMLDivElement, DialogPortalProps>(
  (props, ref) => {
    const { present, render, portal, floatingPortal } = props;

    if (present) {
      let child = render(ref);
      if (portal) {
        child = <Portal floatingPortal={floatingPortal}>{child}</Portal>;
      }
      return child;
    }

    return null;
  },
);

interface DialogContentProps {
  context: FloatingContext;
  dismiss?: DismissProps;
  animate?: boolean;
  children: React.ReactNode;
  focusProps?: Omit<FloatingFocusManagerProps, "context">;
  onActivate?: (props: { activeElement: HTMLElement | null }) => void;
  Content?: DialogProps["PanelComponent"];
  contentProps: DialogProps["panelProps"];
  Container: DialogProps["Container"];
  containerProps: any;
  animation?: AnimatedProps;
  modal?: boolean;
  uiOwnerState: any;
  present: boolean;
  
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (props, forwardRef) => {
    const {
      context,
      dismiss,
      animate,
      animation: animationProps,
      children,
      modal,
      Content,
      contentProps,
      Container,
      containerProps,
      focusProps,
      uiOwnerState,
      present,
    } = props;

    const layer = useLayer();
    const { isTopLayer } = layer;

    const outsidePress = React.useCallback(() => {
      console.log("outsidePress: isTopLayer:", isTopLayer);
      return isTopLayer;
    }, [isTopLayer]);

    const { getFloatingProps } = useInteractions(
      [
        useRole(context),
        useDismiss(context, {
          enabled: !!dismiss,
          outsidePress,
          ...dismiss,
        }),
      ].filter(Boolean),
    );

    const ref = useRefs(forwardRef, context.refs.setFloating as any);
    const open = context.open;
    const { className, style } = contentProps!;
    const animation = React.useMemo(
      () =>
        getAnimationData(
          { className, style, animate, animation: animationProps },
          open,
        ),
      [open, animationProps, className, style, animate],
    );

    const finalProps = getFloatingProps(contentProps);
    const ContainerRoot = Container ?? DialogContainerRoot;
    const Panel = (Content as typeof DialogPanel) ?? DialogPanel;
    const child = (
      <ContainerRoot
        data-ui="DialogContainer"
        {...containerProps}
        //as={Container}
        data-state={open ? "open" : "close"}
        ownerState={containerProps?.ownerState ? {...uiOwnerState, ...containerProps.ownerState} : uiOwnerState}
      >
        <Panel
          data-ui="DialogContent"
          {...finalProps}
          {...animation}
          ownerState={finalProps.ownerState ?  {...uiOwnerState, ...finalProps.ownerState} : uiOwnerState}
          //as={Content as any}
          animate={animate}
          data-state={open ? "open" : "close"}
          data-animate={JSON.stringify((animationProps as any))}
          ref={ref}
        >
          {children}
        </Panel>
      </ContainerRoot>
    );

    if (!focusProps) {
      return child;
    }

    return (
      <FloatingFocusManager context={context} {...focusProps}>
        {child}
      </FloatingFocusManager>
    );
  },
);

export const useDialogContext = useFloatingContext;

export type { DialogHeaderProps, DialogBodyProps, DialogFooterProps };

type DialogMembers = {
  Header: typeof DialogHeader,
  Body: typeof DialogBody,
  Content: typeof DialogBody,
  Footer: typeof DialogFooter,
}

const Dialog:React.FC<DialogProps> & DialogMembers = Object.assign(DialogFc, {
  Header: DialogHeader,
  Body: DialogBody,
  Content: DialogBody,
  Footer: DialogFooter,
});

export { Dialog, DialogHeader, DialogBody, DialogFooter };
export default Dialog;
