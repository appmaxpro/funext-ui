import React, { useContext, useMemo } from "react";
import { css } from "@emotion/react";

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
  useFloatingParentNodeId,
  useFloatingNodeId,
  useFloatingTree,
  FloatingPortalProps,
  FloatingRootContext,
} from "@floating-ui/react";

// framer-motion

// utils
import classnames from "classnames";
import merge from "deepmerge";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  NewAnimatePresenceProps,
  DismissProps,
  AnimationProps,
} from "../../types/generic";
import type {
  open,
  handler,
  size,
  dismiss,
  animate,
  className,
  children,
} from "../../types/components/dialog";

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
  SxThemeProps,
  useMuxDefaultProps,
  useTheme,
  type SxComponentProps,
} from "../../styles";
import { capitalize, isElement } from "../../utils";
import Panel, { PanelProps } from "../Panel";
import { MuxFloatingProvider, useFloatingContext } from "../Context";
import { Presence } from "../../lib/presence";
import { LayerProvider, useLayer } from "../../lib/layer";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

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

const defaultAnimateCss = css`
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  animation: fadeIn 200ms ease-out;
  // Animates the dialog card.
  & > [data-ui="DialogContainer"] {
    animation: zoomIn 200ms ease-out;
  }
  & > [data-ui="DialogBackdrop"] {
    animation: fadeIn 300ms ease-out;
  }
`;

/**
 * @internal
 */
export interface AnimationDialogStyleProps {
  animate: boolean;
}

export function animationDialogStyle(
  props: AnimationDialogStyleProps,
): ReturnType<typeof css> {
  if (!props.animate) return css``;

  return defaultAnimateCss;
}

const DialogRoot = styled("div", {
  name: "MuxDialog",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root,
})<SxComponentProps<any>>(
  {
    position: "absolute",
    inset: 0,
  },
  animationDialogStyle,
);

const DialogBackdrop = styled("div", {
  name: "MuxDialog",
  slot: "Backdrop",
  overridesResolver: (props, styles) => styles.backdrop,
})({
  // Improve scrollable dialog support.
  zIndex: -1,
  inset: 0,
});

const DialogContainer = styled("div", {
  name: "MuxDialog",
  slot: "Container",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.container, styles[`scroll${capitalize(ownerState.scroll)}`]];
  },
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
);

export interface DialogProps extends SxComponentProps<"div"> {
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
  open: boolean;
  handler?: handler;

  dismiss?: DismissProps | false;
  animate?: AnimationProps | false;
  children: children;
  target?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  focusProps?: Omit<FloatingFocusManagerProps, "context" | "children">;
  backdropProps?: any;
  elevation?: number;
  /**
   * The component used to render the body of the dialog.
   * @default Panel
   */
  PanelComponent?: React.JSXElementConstructor<PanelProps>;
  /**
   * Props applied to the [`Panel`](https://mui.com/material-ui/api/panel/) element.
   * @default {}
   */
  panelProps?: Partial<PanelProps<React.ElementType>>;

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

  containerProps?: any;

  modal?: boolean;
}

const DialogFc = React.forwardRef<HTMLDivElement, DialogProps>(
  (inProps, ref) => {
    const props = useMuxDefaultProps({ props: inProps, name: "MuxDialog" });
    const id = useId();
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    

    const layer = useLayer();
    const { isTopLayer } = layer;

    let {
      "aria-describedby": ariaDescribedby = descriptionId,
      "aria-labelledby": ariaLabelledbyProp = labelId,
      "aria-modal": ariaModal = true,
      open,
      handler,
      size,
      dismiss,
      animate,
      className,
      target,
      focusProps,
      backdropProps = {},
      elevation = 24,
      children,
      fullScreen = size === "xxl",
      fullWidth = fullScreen,
      PanelComponent = Panel,
      panelProps = {},
      scroll = "panel",
      onClick,
      containerProps,
      modal = true,
      ...rest
    } = props;
    const isFullScreen = fullScreen || size === "xxl";

    const prefersReducedMotion = usePrefersReducedMotion()
    const hasAnimate = prefersReducedMotion ? false : !animate

    // 1. init
    const { dialog } = useTailwindTheme();
    const {
      defaultProps,
      valid,
      styles: { base, sizes },
    } = dialog;

    // 2. set default props
    handler = handler ?? undefined;
    size = size ?? defaultProps.size;
    dismiss = dismiss ?? defaultProps.dismiss;

    const ownerState = {
      ...props,
      fullScreen: isFullScreen,
      fullWidth,
      size,
      scroll,
    };

    // 3. set styles
    let backdropClasses = backdropProps
      ? twMerge(
          classnames(objectsToString(base.backdrop)),
          backdropProps.className,
        )
      : undefined;

    const animated =
      animate !== false ? (animate ?? defaultProps.animate) : null;

    const theme = useTheme();

    const outsidePress = React.useCallback(() => isTopLayer, [isTopLayer]);
    //const useDismissRef = React.use
    // 5. set @floating-ui
    const { refs, context, floatingStyles } = useFloating({
      open,
      onOpenChange: handler,
      strategy: "fixed",
      elements: target
        ? {
            reference: isElement(target) ? target : target?.current,
          }
        : undefined,
    });

    const { getFloatingProps } = useInteractions(
      [
        useRole(context),
        dismiss
          ? useDismiss(context, {
              outsidePress,
              ...dismiss,
            })
          : undefined,
      ].filter(Boolean),
    );

    const mergedRef = useMergeRefs([ref, refs.floating]);

    const classes = useUtilityClasses(ownerState);

    const renderContent: React.ReactNode = useMemo(
      () => (
        <DialogRoot
          {...rest}
          style={{
            position: context.strategy,
            ...rest.style,
          }}
          className={clsx(classes.root, className)}
          ownerState={ownerState}
          data-ui="Dialog"
          animate={hasAnimate}
        >
          {/* roles are applied via cloneElement from TransitionComponent */}
          {/* roles needs to be applied on the immediate child of Modal or it'll inject one */}
          <DialogContainer
            className={clsx(classes.container)}
            {...containerProps}
            ownerState={ownerState}
            data-ui="DialogContainer"
          >
            <DialogPanel
              {...getFloatingProps({
                ref: mergedRef,
                style: {},
              })}
              //@ts-ignore
              as={PanelComponent}
              elevation={elevation}
              role="dialog"
              aria-describedby={ariaDescribedby}
              aria-labelledby={ariaLabelledbyProp}
              aria-modal={ariaModal}
              fill
              {...panelProps}
              className={clsx(classes.panel, panelProps.className)}
              ownerState={ownerState}
              data-ui="DialogPanel"
            >
              <FloatingFocusManager {...focusProps} context={context}>
                <>{children}</>
              </FloatingFocusManager>
            </DialogPanel>
          </DialogContainer>
        </DialogRoot>
      ),
      [className, classes.container, classes.panel, classes.root, elevation],
    );

    if (!modal) {
      return (<MuxFloatingProvider type="dialog" context={context}>
        <LayerProvider zOffset={theme.zIndex.modal}>
          {renderContent}
        </LayerProvider>
      </MuxFloatingProvider>);
    }

    // 7. return
    return (
      <MuxFloatingProvider type="dialog" context={context}>
        <LayerProvider zOffset={theme.zIndex.modal}>
          <Presence present={open}>
            <FloatingPortal id="mux-portal">
              <FloatingOverlay
                className="z-modal overflow-hidden inset-0"
                lockScroll
              >
                {backdropProps && (
                  <DialogBackdrop
                    className={backdropClasses}
                    style={{
                      position: context.strategy,
                      ...backdropProps.style,
                    }}
                    data-ui="DialogBackdrop"
                  />
                )}
                {renderContent}
              </FloatingOverlay>
            </FloatingPortal>
          </Presence>
        </LayerProvider>
      </MuxFloatingProvider>
    );
  },
);

DialogFc.displayName = "Mux.Dialog";

export const useDialogContext = useFloatingContext;

export type { DialogHeaderProps, DialogBodyProps, DialogFooterProps };

const Dialog = Object.assign(DialogFc, {
  Header: DialogHeader,
  Body: DialogBody,
  Content: DialogBody,
  Footer: DialogFooter,
  Tree: FloatingTree,
});

export { Dialog, DialogHeader, DialogBody, DialogFooter };
export default Dialog;
