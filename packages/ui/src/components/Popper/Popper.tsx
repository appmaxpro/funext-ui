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
import { Portal } from "../../lib/portal";
import { Presence } from "../../lib/presence";
import Overlay, { OverlayProps } from "../Overlay";
import Panel, { PanelProps } from "../Panel";
import { PopperContextProvider } from "./PopperContext";
import { EMPTY_ARRAY, EMPTY_RECORD } from "../../lib/constants";
import { zIndex } from "../../theme/types";
import { getElementRef } from "../../lib/getElementRef";
import {
  AnimatedProps,
  getAnimationSafe,
  shouldForwardProp,
} from "../internal/animation";
import { useEvent } from "../../hooks/use-event";
import { useFloatingContext } from "../Context";

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
})(getAnimationSafe, ({ ownerState }: any) =>
  !ownerState.isPositioned
    ? {
        animation: "none",
      }
    : undefined,
) as StyledComponent<PanelProps & AnimatedProps>;

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
const rawTrigger = Symbol.for("popper-raw-trigger");
const setRawTrigger = (element: any) => (element["$rawTrigger"] = rawTrigger);
const hasTrigger = (element: any) =>
  typeof element === "function" && element["$rawTrigger"] === rawTrigger;


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
  onPresent?: (present: boolean) => void;
  strategy?: FloatingContext["strategy"];
  placement?: Placement;
  sideOffset?: number;
  alignOffset?: number;
  arrowPadding?: number;
  inline?: boolean;
  dismiss?: DismissProps;
  animate?: boolean;
  children: React.ReactNode;
  arrow?: ArrowProps | boolean;
  reference?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  hoverProps?: UseHoverProps;
  clickProps?: UseClickProps;
  trigger?: React.ReactNode;
  triggerRef?: React.ForwardedRef<HTMLElement | null>;
  preventOverflow?: boolean;
  fallbackPlacements?: Placement[];
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  updatePositionStrategy?: "optimized" | "always";
  boundary?: Boundary | Boundary[];
  boundaryPadding?: number | Partial<Record<Side, number>>;
  elementProps?: (context: FloatingContext) => Array<ElementProps | void>;
  portal?: boolean;
  focusProps?: FloatingFocusManagerProps;
  navigate?: boolean;
  middleware?: Middleware[];
  lazy?: boolean;
  Content?: React.JSXElementConstructor<typeof Panel>;
  contentProps?: Partial<PanelProps<React.ElementType, { animate?: boolean }>>;
  Overlay?: React.ComponentType<Partial<OverlayProps>>;
  overlayProps?: Partial<OverlayProps>;
  root?: string | HTMLElement;
  PopperContentRoot?: React.ComponentType<Partial<ComponentRootProps>>;
  RootComponent?: React.ComponentType<Partial<ComponentRootProps>>;
  nodeId?: string | undefined;
  contextProps?: any;
  type?: string;
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
  trigger: triggerProps,
  triggerRef: triggerRefProps,
  preventOverflow = true,
  fallbackPlacements,
  sticky,
  updatePositionStrategy,
  zOffset,
  boundary: boundaryProps = EMPTY_ARRAY,
  boundaryPadding: paddingProps = 0,
  elementProps,
  portal = true,
  overlayProps,
  Overlay: OverlayComp = overlayProps ? Overlay : undefined,
  focusProps,
  navigate,
  middleware: middlewareProps,
  lazy,
  hideWhenDetached,
  root,
  onPresent,
  PopperContentRoot,
  RootComponent = PopperContentRoot,
  nodeId,
  contextProps: props,
  type = "popover",
  ...rest
}: PopperProps) => {
  const [initialized, setInitialized] = React.useState(false);

  zOffset ??= 10;

  fallbackPlacements =
    fallbackPlacements ?? DEFAULT_FALLBACK_PLACEMENTS[placement ?? "bottom"];

  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = (prefersReducedMotion ? false : !!animateProps) || true;

  const arrow = isRecord(arrowProps)
    ? arrowProps
    : arrowProps === true
      ? DEFAULT_POPPER_ARROW
      : undefined;

  const arrowRef = useRef(null);

  const arrowSize = useSize(arrowRef.current);

  const arrowWidth = arrowSize?.width ?? 0;
  const arrowHeight = arrowSize?.height ?? 0;

  const collisionPadding =
    typeof paddingProps === "number"
      ? paddingProps
      : { top: 0, right: 0, bottom: 0, left: 0, ...paddingProps };

  const trigger = triggerProps as React.ReactElement;

  const hasReference = !!reference && !trigger;

  const middleware = useMemo(() => {
    if (middlewareProps) {
      return middlewareProps;
    }
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

  const parentContext = useFloatingContext();
  // 5. set @floating-ui
  const { context } = useFloating({
    rootContext:
      parentContext?.type !== "tooltip" ? parentContext?.context : undefined,
    open,
    nodeId,
    placement,
    strategy,
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

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
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
      getItemProps,
      arrowRef,
      props,
    }),
    [context, getFloatingProps, getReferenceProps, getItemProps, props],
  );

  React.useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
    }
  }, [open]);

  if (lazy && !initialized && !hasReference) {
    //return trigger;
  }
  const Root = RootComponent ?? ComponentRoot;

  return (
    <PopperContextProvider value={contextValue} type={type}>
      {trigger &&
        (hasTrigger(trigger?.type) ? (
          trigger
        ) : (
          <PopperTrigger
            getReferenceProps={getReferenceProps}
            setReference={context.refs.setReference as any}
            data-state={context.open ? "open" : undefined}
          >
            {trigger}
          </PopperTrigger>
        ))}
      <Presence animate={animate} present={!!open}>
        {({ present }) => (
          <PopperPortal
            portal={!!root || !!portal}
            floatingPortal={root ? root : !!focusProps || !!navigate}
            present={present}
            onPresent={onPresent}
            render={(ref: React.ForwardedRef<HTMLDivElement>) => (
              <LayerProvider zOffset={zOffset}>
                {OverlayComp && (
                  <OverlayComp
                    data-ui="PopperOverlay"
                    {...overlayProps}
                    animate={animate}
                  />
                )}

                <Root
                  {...rest}
                  context={context}
                  getFloatingProps={getFloatingProps}
                  focusProps={focusProps}
                  navigate={navigate}
                  arrow={arrow}
                  arrowRef={arrowRef}
                  animate={animate}
                  ref={ref}
                >
                  {children}
                </Root>
              </LayerProvider>
            )}
          />
        )}
      </Presence>
    </PopperContextProvider>
  );
};

interface PopperPortalProps {
  portal?: boolean;
  floatingPortal?: boolean | string | HTMLElement;
  present: boolean;
  onPresent?: PopperProps["onPresent"];
  render: (ref: React.ForwardedRef<HTMLDivElement>) => React.ReactNode | null;
}
const PopperPortal = React.forwardRef<HTMLDivElement, PopperPortalProps>(
  (props, ref) => {
    const { present, render, portal, floatingPortal, onPresent } = props;

    //const onPresentRef = React.useRef(false);
    React.useEffect(() => {
      if (onPresent) {
        //onPresentRef.current = present;
        onPresent(present);
      }
    }, [present]);

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

export interface ComponentRootProps extends SxComponentProps, AnimatedProps {
  context: FloatingContext;
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  arrow?: ArrowProps;
  arrowRef: React.MutableRefObject<HTMLElement | null>;
  animate?: boolean;
  focusProps?: FloatingFocusManagerProps;
  navigate?: boolean;
  onActivate?: (props: { activeElement: HTMLElement | null }) => void;
  Content?: React.JSXElementConstructor<typeof Panel>;
  contentProps?: Partial<PanelProps<React.ElementType>>;
}

const ComponentRoot = React.forwardRef<HTMLDivElement, ComponentRootProps>(
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
      Content = ContentRoot,
      contentProps = EMPTY_RECORD,
      style,
      animation,
      ...rest
    } = props;

    const { open, middlewareData, refs, floatingStyles, isPositioned } =
      context;

    const { zIndex, isTopLayer } = useLayer();

    //const onActivateCB = useEvent(onActivate);

    ///useEffect(()=> onActivateCB(document.activeElement), [isTopLayer])
    //useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(forwardedRef, () => ref.current)

    const ownerState = {
      ...rest,
      navigate,
      arrow,
      animate,
      isPositioned: isPositioned || animate !== false, // consider it positioned if animation is disabled, to avoid animation flashes
      zIndex,
    };
    //context.dataRef
    const child =
      !navigate && !focusProps ? (
        children
      ) : (
        <FloatingFocusManager context={context} {...focusProps}>
          {children}
        </FloatingFocusManager>
      );

    const ContentSlot = Content as React.ComponentType<
      PanelProps<React.ElementType, { animate?: boolean }>
    >;
    const [side, align] = getPlacementSides(context.placement);

    return (
      <PopperRoot
        data-state={open ? "open" : "close"}
        data-ui="Popper"
        ownerState={ownerState}
        ref={refs.setFloating}
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
        <ContentSlot
          data-ui="PopperContent"
          {...contentProps}
          data-side={side}
          data-align={align}
          data-state={open ? "open" : "close"}
          animate={animate}
          animation={animation}
          data-animation={animation}
          ownerState={ownerState}
          ref={ref}
        >
          {child}
        </ContentSlot>
        {arrow && (
          <Arrow
            data-ui="PopperArrow"
            {...arrow}
            ref={arrowRef as any}
            context={context}
            data-state={open ? "open" : "close"}
          />
        )}
      </PopperRoot>
    );
  },
);

type PopperTriggerProps = React.HTMLAttributes<"button"> & {
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  children: React.ReactElement;
  setReference: (node: HTMLElement | null) => void;
};

const PopperTrigger = React.forwardRef<HTMLButtonElement, PopperTriggerProps>(
  ({ children, getReferenceProps, setReference, ...rest }, ref) => {
    const mergedRef = useMergeRefs([
      setReference,
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

export const Popper = Object.assign(PopperFc, {
  Arrow,
  ComponentRoot,
  setRawTrigger,
  hasTrigger,
});

// @ts-ignore
Popper.displayName = "Mux.Popper";

setRawTrigger(PopperTrigger);

export default Popper;
