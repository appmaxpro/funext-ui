import React, { useEffect, useMemo, useRef } from "react";

// @floating-ui
import {
  offset as fuiOffset,
  flip,
  shift,
  hide,
  size,
  inline,
  arrow as fuiArrow,
  Middleware,
  autoUpdate,
  useFloating,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  useHover,
  UseHoverProps,
  UseClickProps,
  safePolygon,
  limitShift,
  UseInteractionsReturn,
  FloatingFocusManager,
  FloatingFocusManagerProps,
  FloatingArrow,
  FloatingOverlay,
  Boundary,
  useMergeRefs,
  Rect,
  FloatingArrowProps,
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
  DEFAULT_POPPER_ARROW,
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
import { useRefs } from "../../hooks";
import { Portal, PortalProps } from "../../lib/portal";
import { Presence, PresenceProps } from "../../lib/presence";
import Overlay, { OverlayProps } from "../Overlay";
import Panel, { PanelProps } from "../Panel";
import { PopperContextProvider, usePopper } from "./PopperContext";
import { EMPTY_ARRAY, EMPTY_RECORD } from "../../lib/constants";
import { zIndex } from "../../theme/types";
import { getElementRef } from "../../lib/getElementRef";
import {
  AnimatedProps,
  getAnimationSafe,
  shouldForwardProp,
} from "../internal/animation";
import { useCallbackRef } from "../../hooks/use-callback-ref";

const Arrow = styled(FloatingArrow)("");

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

const PopperRoot = styled("div", {
  name: "Popper",
  shouldForwardProp,
})(({ ownerState }: any) => ({
  minWidth: "max-content",
  zIndex: ownerState?.zIndex,
}));

const ContentRoot = styled(Panel, {
  name: "PopperContent",
  //slot: "Root",
  shouldForwardProp,
})(getAnimationSafe, 
  ({ ownerState }: any) => ({
  // if the PopperContent hasn't been placed yet (not all measurements done)
  // we prevent animations so that users's animation don't kick in too early referring wrong sides
  animation: !ownerState.isPositioned ? "none" : undefined,
})) as StyledComponent<PanelProps & AnimatedProps>;

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
export interface PopperProps extends Omit<LayerProps, "as">, AnimatedProps {
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
  strategy?: FloatingContext["strategy"];
  placement?: Placement;
  sideOffset?: number;
  alignOffset?: number;
  arrowPadding?: number;
  boundaryPadding?: number | Partial<Record<Side, number>>;
  inline?: boolean;
  dismiss?: DismissProps;
  animate?: boolean;
  children: React.ReactNode;
  arrow?: ArrowProps | boolean;
  reference?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  hoverProps?: UseHoverProps;
  clickProps?: UseClickProps;
  preventOverflow?: boolean;
  fallbackPlacements?: Placement[];
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  updatePositionStrategy?: "optimized" | "always";
  boundary?: Boundary | Boundary[];
  elementProps?: (context: FloatingContext) => Array<ElementProps | void>;
  middleware?: Middleware[];
}

const PopperFc = ({
  constrainSize,
  matchReferenceWidth,
  open,
  onOpenChange,
  strategy,
  placement,
  sideOffset = 0,
  alignOffset = 0,
  arrowPadding,
  inline: inlineProps,
  dismiss,
  animate: animateProps,
  arrow: arrowProps,
  hoverProps,
  clickProps,
  children,
  reference,
  preventOverflow = true,
  fallbackPlacements,
  sticky,
  updatePositionStrategy,
  zOffset,
  boundary: boundaryProps = EMPTY_ARRAY,
  boundaryPadding: paddingProps = 0,
  elementProps,
  middleware: middlewareProps,
  hideWhenDetached,
}: PopperProps) => {
  zOffset ??= 10;

  fallbackPlacements =
    fallbackPlacements ?? DEFAULT_FALLBACK_PLACEMENTS[placement ?? "bottom"];

  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = (prefersReducedMotion ? false : !!animateProps) || true;

  const arrow = isRecord(arrowProps) || arrowProps === true;

  const arrowRef = useRef(null);

  const arrowSize = useSize(arrowRef.current);

  const arrowWidth = arrowSize?.width ?? 0;
  const arrowHeight = arrowSize?.height ?? 0;

  const middleware = useMemo(() => {
    if (middlewareProps) {
      return middlewareProps;
    }
    const collisionPadding =
      typeof paddingProps === "number"
        ? paddingProps
        : { top: 0, right: 0, bottom: 0, left: 0, ...paddingProps };

    const ret: Middleware[] = [];
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

    if (inlineProps) {
      ret.push(inline());
    }

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
    inlineProps,
    fallbackPlacements,
    preventOverflow,
    constrainSize,
    boundaryProps,
    paddingProps,
    sideOffset,
    alignOffset,
    arrowHeight,
  ]);

  // 5. set @floating-ui
  const { context } = useFloating({
    open,
    placement,
    strategy,
    onOpenChange: useCallbackRef(onOpenChange),
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
      clickProps && useClick(context, clickProps),
      hoverProps && useHover(context, hoverProps),
      dismiss && useDismiss(context, dismiss),
      ...(elementProps ? elementProps?.(context) : []),
    ].filter(Boolean),
  );

  const contextValue = React.useMemo(
    () => ({
      context,
      getReferenceProps,
      getFloatingProps,
      arrowRef,
    }),
    [context, getFloatingProps, getReferenceProps],
  );

  return (
    <PopperContextProvider value={contextValue}>
      {children}
    </PopperContextProvider>
  );
};

interface PopperPortalProps {
  forceMount?: boolean;
  animate?: boolean;
  children: React.ReactNode;
  onPresent?: (present: boolean) => void;
  portal?: boolean;
  floatingPortal?: boolean | string | HTMLElement;
  root: PortalProps["root"];
}

const PopperPortal: React.FC<PopperPortalProps> = (
  props: PopperPortalProps,
) => {
  const { context } = usePopper();

  const { animate, forceMount, ...rest } = props;
  return (
    <Presence animate={animate} present={forceMount || context.open}>
      {({ present }) => <PortalContent present={present} {...rest} />}
    </Presence>
  );
};

interface PortalContentProps
  extends Omit<PopperPortalProps, "forceMount" | "animate"> {
  present: boolean;
}

const PortalContent = React.forwardRef<HTMLDivElement, PortalContentProps>(
  (
    {
      onPresent: onPresentProps,
      present,
      children,
      portal,
      root,
      floatingPortal,
    },
    ref,
  ) => {
    const onPresent = useCallbackRef(onPresentProps);
    const onPresentRef = React.useRef<boolean | null>(null);
    React.useEffect(() => {
      if (onPresent && present !== onPresentRef.current) {
        onPresentRef.current = present;
        onPresent(present);
      }
    }, [present]);

    if (present) {
      let child = React.cloneElement(children as React.ReactElement, { ref });
      if (portal) {
        child = (
          <Portal root={root} floatingPortal={floatingPortal}>
            {child}
          </Portal>
        );
        return child;
      }
    }
    return null;
  },
);

export interface PopperContentProps extends SxComponentProps, AnimatedProps {
  onActivate?: (props: { activeElement: HTMLElement | null }) => void;
}

const PopperContent = React.forwardRef<HTMLDivElement, PopperContentProps>(
  (props, forwardRef) => {
    const { children, animate, style, animation, ...rest } = props;

    const { context, getFloatingProps } = usePopper();

    const { open, middlewareData, refs, floatingStyles, isPositioned } =
      context;

    const { zIndex } = useLayer();

    const ownerState = {
      ...rest,
      isPositioned,
      zIndex,
    };

    const [side, align] = getPlacementSides(context.placement);
    const ref = useRefs(forwardRef, refs.setFloating);

    return (
      <PopperRoot
        data-state={open ? "open" : "close"}
        data-side={side}
        data-align={align}
        data-ui="Popper"
        ownerState={ownerState}
        ref={ref}
        {...getFloatingProps({
          ...rest,
          style:
            typeof style === "function"
              ? style(context)
              : {
                  ...floatingStyles,
                  transform: floatingStyles.transform, // keep off the page when measuring
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
                  ...style,
                },
        })}
      >
        {children}
      </PopperRoot>
    );
  },
);

type PopperTriggerProps = React.HTMLAttributes<"button"> & {
  children: React.ReactElement;
};

const PopperTrigger = React.forwardRef<HTMLButtonElement, PopperTriggerProps>(
  ({ children, ...rest }, ref) => {
    const { context, getReferenceProps } = usePopper();

    const mergedRef = useMergeRefs([
      context.refs.setReference,
      ref,
      getElementRef(children),
    ]);

    const refProps = getReferenceProps({
      ...rest,
      ref: mergedRef,
      onClick(event: any) {
        event.stopPropagation();
        children.props.onClick?.(event);
      },
    } as any);
    //console.log("MenuHandler: ReferenceProps:", refProps)
    return React.cloneElement(children, {
      ...refProps,
    });
  },
);

const PopperArrow = React.forwardRef<SVGSVGElement, FloatingArrowProps>(
  (props, forwardRef) => {
    const { context } = usePopper();
    return <Arrow {...props} context={context} ref={forwardRef} />;
  },
);

export const Popper: React.FC<PopperProps> = Object.assign(PopperFc, {
  Portal: PopperPortal,
  Content: PopperContent,
  Trigger: PopperTrigger,
  Arrow: PopperArrow,
});

// @ts-ignore
Popper.displayName = "Mux.Popper";

export default Popper;
