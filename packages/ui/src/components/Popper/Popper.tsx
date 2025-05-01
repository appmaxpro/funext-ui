import React, { useEffect, useMemo, useRef } from "react";

// @floating-ui
import {
  offset as fuiOffset,
  flip,
  shift,
  hide,
  size,
  autoUpdate,
  useFloating,
  useInteractions,
  useRole,
  useDismiss,
  useId,
  useClick,
  arrow as fuiArrow,
  useHover,
  safePolygon,
  UseHoverProps,
  Middleware,
  limitShift,
  UseInteractionsReturn,
  FloatingFocusManager,
  FloatingFocusManagerProps,
  FloatingArrow,
  FloatingOverlay,
  Boundary,
  UseClickProps,
} from "@floating-ui/react";

// utils
import merge from "deepmerge";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  handler,
  Placement,
  ArrowProps,
  DismissProps,
  Side,
  FloatingContext,
  ElementProps,
} from "./types";

// popover components
import { isElement } from "../../utils";
import {
  getPlacementSides,
  origin,
  transformOrigin,
} from "../../lib/helpers/origin";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

import {
  DEFAULT_POPPER_DISTANCE,
  DEFAULT_FALLBACK_PLACEMENTS,
  DEFAULT_POPPER_PADDING,
  DEFAULT_ARROW,
} from "./constants";
import {
  styled,
  StyledComponent,
  SxComponentProps,
  useSlot,
  useTheme,
} from "../../styles";
import { Layer, LayerProps, LayerProvider, useLayer } from "../../lib/layer";
import { isRecord } from "../../lib/isRecord";
import { useSize } from "../../hooks/use-size";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useRefs } from "../../hooks";
import { Portal } from "../../lib/portal";
import { Presence } from "../../lib/presence";
import Overlay, { OverlayProps } from "../Overlay";
import Panel, { PanelProps } from "../Panel";
import { PopperContextProvider } from "./PopperContext";
import { EMPTY_ARRAY, EMPTY_RECORD } from "../../lib/constants";
import { zIndex } from "../../theme/types";

const Arrow = styled(FloatingArrow)("");

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export type PopperSlots = {
  slots?: {
    overlay: React.JSXElementConstructor<typeof Overlay>;
    panel: React.JSXElementConstructor<typeof Panel>;
  };
  slotProps?: {
    overlay?: Partial<OverlayProps>;
    panel?: Partial<PanelProps<React.ElementType, { animate?: boolean }>>;
  };
};
export interface PopperProps extends Omit<LayerProps, "as"> {
  /**
   * When `true`, prevent overflow within the current boundary:
   * - by flipping on its side axis
   * - by resizing
  /*
   * Note that:
   * - setting `preventOverflow` to `true` also prevents overflow on its side axis
   * - setting `matchReferenceWidth` to `true` also causes the popover to resize
   *
   * @defaultValue false
   */
  constrainSize?: boolean;
  /**
   * When `true`, set the maximum width to match the reference element, and also prevent overflow within
   * the current boundary by resizing.
   *
   * Note that setting `constrainSize` to `true` also causes the popover to resize
   *
   * @defaultValue false
   */
  matchReferenceWidth?: boolean;
  open?: boolean;
  onOpenChange?: handler;
  placement?: Placement;
  sideOffset?: number;
  alignOffset?: number;
  arrowPadding?: number;
  dismiss?: DismissProps;
  animate?: boolean;
  children: React.ReactNode;
  arrow?: ArrowProps | boolean;
  reference?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  hoverProps?: UseHoverProps;
  clickProps?: UseClickProps;
  trigger?: React.ReactNode;

  preventOverflow?: boolean;
  fallbackPlacements?: Placement[];
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  updatePositionStrategy?: "optimized" | "always";
  boundary?: Boundary | Boundary[];
  boundaryPadding?: number | Partial<Record<Side, number>>;
  elementProps?: (context: FloatingContext) => Array<ElementProps | void>;
  portal?: boolean;
  focusProps?: Omit<FloatingFocusManagerProps, "context">;
  navigate?: boolean;
  middleware?: Middleware[];
  lazy?: boolean;
  Content?: React.JSXElementConstructor<typeof Panel>;
  contentProps?: Partial<PanelProps<React.ElementType, { animate?: boolean }>>;
  Overlay?: React.ComponentType<Partial<OverlayProps>>;
  overlayProps?: Partial<OverlayProps>;
  root?: string | HTMLElement 
}

const PopperFc = ({
  constrainSize,
  matchReferenceWidth,
  open,
  onOpenChange,
  placement,
  sideOffset = 0,
  alignOffset = 0,
  arrowPadding,
  dismiss,
  animate: animateProps,
  arrow: arrowProps,
  hoverProps,
  clickProps,
  children,
  reference,
  trigger,
  preventOverflow = true,
  fallbackPlacements,
  sticky,
  updatePositionStrategy,
  zOffset,
  boundary: boundaryProps,
  boundaryPadding: paddingProps,
  elementProps,
  portal = true,
  overlayProps,
  focusProps,
  navigate,
  middleware: middlewareProps,
  lazy,
  hideWhenDetached,
  root,
  ...rest
}: PopperProps) => {
  // 1. init
  const {
    popover: { defaultProps },
  } = useTailwindTheme();
  const [initialized, setInitialized] = React.useState(false);

  zOffset ??= 10;

  fallbackPlacements =
    fallbackPlacements ?? DEFAULT_FALLBACK_PLACEMENTS[placement ?? "bottom"];

  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = prefersReducedMotion ? false : !!animateProps;

  const arrow = isRecord(arrowProps)
    ? arrowProps
    : arrowProps === true
      ? DEFAULT_ARROW
      : undefined;

  const arrowRef = useRef(null);

  const arrowSize = useSize(arrowRef.current);

  const arrowWidth = arrowSize?.width ?? 0;
  const arrowHeight = arrowSize?.height ?? 0;

  const collisionPadding =
    typeof paddingProps === "number"
      ? paddingProps
      : { top: 0, right: 0, bottom: 0, left: 0, ...paddingProps };

  const middleware = useMemo(() => {
    const ret: Middleware[] = [];
    if (middlewareProps) {
      return middlewareProps;
    }

    const boundary = Array.isArray(boundaryProps)
      ? boundaryProps
      : [boundaryProps];
    const hasExplicitBoundaries = boundary.length > 0;

    const detectOverflowOptions = {
      padding: collisionPadding,
      boundary: boundary.filter(isNotNull),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: hasExplicitBoundaries,
      //constrainSize,
      //matchReferenceWidth,
    };
    // Define distance between reference and floating element
    ret.push(
      fuiOffset({
        mainAxis: sideOffset + arrowHeight,
        alignmentAxis: alignOffset,
      }),
    );

    // Shift the popover so its sits within the boundary element
    if (preventOverflow) {
      ret.push(
        shift({
          mainAxis: true,
          crossAxis: false,
          limiter: sticky === "partial" ? limitShift() : undefined,
          ...detectOverflowOptions,
        } as any),
      );
    }

    // Flip the floating element when leaving the boundary box
    if (preventOverflow) {
      ret.push(
        flip({
          fallbackPlacements,
          ...detectOverflowOptions,
        } as any),
      );
    }
    // Track sizes
    if (constrainSize || matchReferenceWidth) {
      ret.push(
        size({
          ...detectOverflowOptions,
          apply: ({
            elements,
            rects,
            availableWidth,
            availableHeight,
          }: any) => {
            const { width, height } = rects.reference;

            if (matchReferenceWidth) {
              elements.floating.style.width = `${width}px`;
            }

            const contentStyle = elements.floating.style;
            contentStyle.setProperty(
              "--popper-available-width",
              `${availableWidth}px`,
            );
            contentStyle.setProperty(
              "--popper-available-height",
              `${availableHeight}px`,
            );
            contentStyle.setProperty("--popper-reference-width", `${width}px`);
            contentStyle.setProperty(
              "--popper-reference-height",
              `${height}px`,
            );
          },
        } as any),
      );
    }

    // Place arrow
    if (arrow) {
      ret.push(
        fuiArrow({
          element: arrowRef,
          padding: arrowPadding ?? DEFAULT_POPPER_PADDING,
        }),
      );
    }

    // Determine the origin to scale from.
    // Must be placed after `transformOrigin` and `shift` middleware.
    if (animate) {
      ret.push(transformOrigin({ arrowWidth, arrowHeight }));
    }
    if (hideWhenDetached)
      ret.push(
        hide({
          padding: DEFAULT_POPPER_PADDING,
          strategy: "referenceHidden",
        }),
      );

    return ret;
  }, [
    animate,
    !!arrow,
    fallbackPlacements,
    preventOverflow,
    constrainSize,
    boundaryProps,
    paddingProps,
    sideOffset,
    alignOffset,
  ]);

  // 5. set @floating-ui
  const { context } = useFloating({
    open,
    placement,
    onOpenChange: onOpenChange,
    elements: reference
      ? {
          reference: isElement(reference) ? reference : reference?.current,
        }
      : undefined,
    middleware,
    whileElementsMounted: (...args) => {
      const cleanup = autoUpdate(...args, {
        animationFrame: updatePositionStrategy === "always",
      });
      return cleanup;
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions(
    [
      clickProps && trigger ? useClick(context, clickProps) : undefined,
      hoverProps && trigger ? useHover(context, hoverProps) : undefined,
      dismiss && useDismiss(context, dismiss),
      ...(elementProps ? elementProps?.(context) : []),
    ].filter(Boolean),
  );

  const contextValue = React.useMemo(
    () => ({
      context,
      getReferenceProps,
      getFloatingProps,
    }),
    [context, getFloatingProps, getReferenceProps],
  );

  React.useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
    }
  }, [open]);

  const hasReference = !!reference && !trigger;
  if (lazy && !initialized && !hasReference) {
    return trigger;
  }

  return (
    <PopperContextProvider value={contextValue}>
      {trigger &&
        React.cloneElement(
          trigger as any,
          getReferenceProps({ ref: context.refs.setReference }),
        )}
      <Presence animate={animate} present={!!open}>
        {({ present }) => (
          <PopperPortal
            portal={!!root || !!portal}
            floatingPortal={root ? root : !!focusProps || !!navigate}
            present={present}
            render={(ref: React.ForwardedRef<HTMLDivElement>) => (
              <LayerProvider zOffset={zOffset}>
                {Overlay && (
                  <Overlay
                    area-hidden
                    data-ui="PopperOverlay"
                    {...overlayProps}
                    animate={animate}
                  />
                )}
                <PopperContent
                  {...rest}
                  context={context}
                  getFloatingProps={getFloatingProps}
                  focusProps={focusProps}
                  navigate={navigate}
                  arrow={arrow}
                  arrowRef={arrowRef}
                  animate={animate}
                  zOffset={zOffset}
                  ref={ref}
                >
                  {children}
                </PopperContent>
              </LayerProvider>
            )}
          />
        )}
      </Presence>
    </PopperContextProvider>
  );
};

// @ts-ignore
Popper.displayName = "Mux.Popper";

interface PopperPortalProps {
  portal?: boolean;
  floatingPortal?: boolean | string | HTMLElement;
  present: boolean;
  render: (ref: React.ForwardedRef<HTMLDivElement>) => React.ReactNode | null;
}
const PopperPortal = React.forwardRef<HTMLDivElement, PopperPortalProps>(
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

const ContentRoot = styled(Panel, {
  name: "PopperContent",
  slot: "Root",
  shouldForwardProp: (propName) => propName !== "animate",
})(({ ownerState }: any) => ({
  // if the PopperContent hasn't been placed yet (not all measurements done)
  // we prevent animations so that users's animation don't kick in too early referring wrong sides
  animation: !ownerState.isPositioned ? "none" : undefined,
})) as StyledComponent<PanelProps & { animate?: boolean }>;

const PopperRoot = styled("div", {
  name: "Popper",
  slot: "Root",
  shouldForwardProp: (propName) => propName !== "animate",
})(({ownerSate}:any) => ({
  minWidth: "max-content",
  zIndex: ownerSate.zIndex
}));

interface PopperPanelProps extends SxComponentProps {
  context: FloatingContext;
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  arrow?: ArrowProps;
  arrowRef: React.MutableRefObject<HTMLElement | null>;
  animate?: boolean;
  focusProps?: Omit<FloatingFocusManagerProps, "context">;
  navigate?: boolean;
  onActivate?: (props: { activeElement: HTMLElement | null }) => void;
  Content?: React.JSXElementConstructor<typeof Panel>;
  contentProps?: Partial<PanelProps<React.ElementType>>;

}

const PopperContent = React.forwardRef<HTMLDivElement, PopperPanelProps>(
  (props, ref) => {
    const {
      context,
      navigate,
      getFloatingProps,
      children,
      arrow,
      arrowRef,
      animate,
      focusProps,
      onActivate,
      zOffset,
      Content = ContentRoot,
      contentProps = EMPTY_RECORD,
      style,
      ...rest
    } = props;

    const { open, middlewareData, refs, floatingStyles, isPositioned } =
      context;

    const { zIndex } = useLayer();

    const ownerState = {
      ...rest,
      navigate,
      arrow,
      animate,
      isPositioned,
      zIndex
    };

    //const mergedRef = useRefs(ref, refs.setFloating);
    const floatingElement = refs.floating.current;

    useEffect(() => {
      if (arrowRef.current && floatingElement) {
        //arrowRef.current.style.fill = getComputedStyle(floatingElement).backgroundColor;
      }
    }, [floatingElement, arrowRef.current]);

    const child = !navigate ? (
      children
    ) : (
      <FloatingFocusManager context={context} {...focusProps}>
        <>{children}</>
      </FloatingFocusManager>
    );
    /*
    const [ContentSlot, contentProps] = useSlot("content", {
      elementType: ContentRoot,
      externalForwardedProps: components,
      ownerState: ownerState,
    });*/
    const ContentSlot = Content as React.ComponentType<
      PanelProps<React.ElementType, { animate?: boolean }>
    >;
    const [side, align] = getPlacementSides(context.placement);

    return (
      <>
        <PopperRoot
          data-state={open ? "open" : "close"}
          data-ui="Popper"
          ownerState={ownerState}
          ref={refs.setFloating}
          {...getFloatingProps({
            ...rest,
            style: typeof style === 'function' ? style(context) : {
              ...floatingStyles,
              transform: isPositioned
                ? floatingStyles.transform
                : "translate(0, -200%)", // keep off the page when measuring
              ["--popper-transform-origin" as any]: [
                middlewareData.transformOrigin?.x,
                middlewareData.transformOrigin?.y,
              ].join(" "),

              // hide the content if using the hide middleware and should be hidden
              // set visibility to hidden and disable pointer events so the UI behaves
              // as if the PopperContent isn't there at all
              ...(middlewareData.hide?.referenceHidden && {
                visibility: "hidden",
                pointerEvents: "none",
              }),
              ...rest.style,
            },
          })}
        >
          <ContentSlot
            data-ui="PopperContent"
            {...contentProps}
            data-side={side}
            data-align={align}
            data-state={open ? "open" : "close"}
            animate={animate}
            ownerState={ownerState}
            ref={ref}
          >
            {child}
            {arrow && (
              <Arrow
                data-ui="PopperArrow"
                {...arrow}
                ref={arrowRef as any}
                context={context}
                data-state={open ? "open" : "close"}
              />
            )}
          </ContentSlot>
        </PopperRoot>
      </>
    );
  },
);

const Popper = Object.assign(PopperFc, {
  Arrow,
});

export { Popper };
export default Popper;
