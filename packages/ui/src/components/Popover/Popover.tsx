import React, { useMemo, useRef } from "react";

// @floating-ui
import {
  offset as fuiOffset,
  flip,
  shift,
  hide,
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
} from "@floating-ui/react";

// utils
import merge from "deepmerge";

// context
import { useTailwindTheme } from "../../theme";
import { PopoverContextProvider, usePopover } from "./PopoverContext";

// types
import type {
  open,
  handler,
  placement,
  offset,
  dismiss,
  animate,
  children,
  ArrowProps,
} from "../../types/components/popover";

// popover components
import { PopoverHandler, PopoverHandlerProps } from "./PopoverHandler";
import { PopoverContent, PopoverContentProps } from "./PopoverContent";
import { isElement } from "../../utils";
import { origin } from "../../lib/helpers/origin";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

import {
  DEFAULT_POPOVER_DISTANCE,
  DEFAULT_FALLBACK_PLACEMENTS,
  DEFAULT_POPOVER_PADDING,
} from "./constants";
import { Placement } from "../../types";
import { useTheme } from "../../styles";
import { LayerProvider } from "../../lib/layer";

export interface PopoverProps {
  open?: open;
  handler?: handler;
  placement?: placement;
  offset?: offset;
  dismiss?: dismiss;
  animate?: animate;
  children: children;
  arrow?: ArrowProps | boolean;
  target?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  hover?: boolean;
  hoverProps?: UseHoverProps;
  trigger?: React.ReactNode;
  onlyHover?: boolean;
  preventOverflow?: boolean;
  fallbackPlacements?: Placement[];
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  updatePositionStrategy?: 'optimized' | 'always';
}

const PopoverFc = ({
  open,
  handler,
  placement,
  offset,
  dismiss,
  animate,
  arrow,
  hover,
  hoverProps,
  onlyHover,
  children,
  target,
  trigger,
  preventOverflow = true,
  fallbackPlacements,
  sticky,
  updatePositionStrategy
}: PopoverProps) => {
  // 1. init
  const {
    popover: { defaultProps },
  } = useTailwindTheme();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const zOffset = useTheme().zIndex.modal;
  // 2. set default props
  open = open ?? internalOpen;
  handler = handler ?? setInternalOpen;
  placement = placement ?? defaultProps.placement;
  offset = offset ?? defaultProps.offset;
  dismiss = dismiss ?? defaultProps.dismiss;
  animate = animate ?? defaultProps.animate;

  fallbackPlacements =
    fallbackPlacements ?? DEFAULT_FALLBACK_PLACEMENTS[placement ?? "bottom"];

  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimate = prefersReducedMotion ? false : !!animate;

  let arrowProps = typeof arrow !== "boolean" ? arrow : defaultProps.arrow;

  const showArrow = typeof arrow === "boolean" ? arrow : !!arrowProps;

  if (showArrow === false) {
    arrowProps = undefined;
  } else if (showArrow) {
    arrowProps = merge(
      defaultProps.arrow ?? defaultProps.arrow,
      arrowProps ?? {},
    );
  }

  // 4. set animation
  const animation = {
    unmount: {
      opacity: 0,
    },
    mount: {
      opacity: 1,
    },
  };
  const appliedAnimation = merge(animation, animate as any);

  const arrowRef = useRef(null);

  const middleware = useMemo(() => {
    const ret: Middleware[] = [];

    // Flip the floating element when leaving the boundary box
    if (preventOverflow) {
      ret.push(
        flip({
          fallbackPlacements,
          padding: DEFAULT_POPOVER_PADDING,
        }),
      );
    }

    // Define distance between reference and floating element
    ret.push(fuiOffset({ mainAxis: DEFAULT_POPOVER_DISTANCE }));

    // Shift the popover so its sits within the boundary element
    if (preventOverflow) {
      ret.push(
        shift({
          mainAxis: true,
          crossAxis: false,
          limiter: sticky === 'partial' ? limitShift() : undefined,
          padding: DEFAULT_POPOVER_PADDING,
        }),
      );
    }
    
    

    // Place arrow
    if (showArrow) {
      ret.push(
        fuiArrow({
          element: arrowRef,
          padding: DEFAULT_POPOVER_PADDING,
        }),
      );
    }

    // Determine the origin to scale from.
    // Must be placed after `@sanity/ui/size` and `shift` middleware.
    if (enableAnimate) {
      ret.push(origin);
    }

    ret.push(
      hide({
        padding: DEFAULT_POPOVER_PADDING,
        strategy: "referenceHidden",
      }),
    );

    return ret;
  }, [animate, enableAnimate, showArrow, fallbackPlacements, preventOverflow]);

  // 5. set @floating-ui
  const { x, y, strategy, refs, isPositioned, context } = useFloating({
    open,
    placement,
    onOpenChange: handler,
    elements: target
      ? {
          reference: isElement(target) ? target : target?.current,
        }
      : undefined,
    middleware,
    whileElementsMounted: (...args) => {
      const cleanup = autoUpdate(...args, {
        animationFrame: updatePositionStrategy === 'always',
      });
      return cleanup;
    },
  });

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const { getReferenceProps, getFloatingProps } = useInteractions([
    !onlyHover ? useClick(context) : undefined,
    useRole(context),
    useDismiss(context, dismiss),
    hover && !hoverProps
      ? useHover(context, {
          handleClose: safePolygon(),
        })
      : hoverProps
        ? useHover(context, hoverProps)
        : undefined,
  ]);


  const contextValue = React.useMemo(
    () => ({
      open,
      strategy,
      x,
      y,
      context,
      reference: refs.setReference,
      floating: refs.setFloating,
      getReferenceProps,
      getFloatingProps,
      appliedAnimation,
      labelId,
      descriptionId,
      arrowRef,
      arrow: arrowProps,
    }),
    [
      open,
      strategy,
      x,
      y,
      context,
      refs.setReference,
      refs.setFloating,
      getFloatingProps,
      getReferenceProps,
      appliedAnimation,
      labelId,
      descriptionId,
      arrowRef,
    ],
  );

  React.useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
    }
  }, [open]);

  const triggerHandler = trigger && <PopoverHandler>{trigger}</PopoverHandler>;

  const hasTarget = !!target && !trigger;
  if (!initialized && hasTarget) {
    return triggerHandler;
  }

  if (trigger) {
    // 6. return
    return (
      <PopoverContextProvider value={contextValue}>
        {triggerHandler}
        <LayerProvider zOffset={zOffset}>
          {(children as any)?.type !== PopoverContent ? (
            <PopoverContent>{children}</PopoverContent>
          ) : (
            children
          )}
        </LayerProvider>
      </PopoverContextProvider>
    );
  }

  // 6. return
  return (
    <PopoverContextProvider value={contextValue}>
      {hasTarget || initialized ? (
        triggerHandler || children
      ) : (
        <LayerProvider zOffset={zOffset}>
          {React.Children.toArray(children).filter(
            (c) => (c as any).type !== PopoverContent,
          )}
        </LayerProvider>
      )}
    </PopoverContextProvider>
  );
};

const Popover = Object.assign(PopoverFc, {
  Handler: PopoverHandler,
  Content: PopoverContent,
});
// @ts-ignore
Popover.displayName = "Mux.Popover";

export type { PopoverHandlerProps, PopoverContentProps };
export { Popover, PopoverHandler, PopoverContent, usePopover };
export default Popover;
