
import React from "react";

// @floating-ui
import {
  useFloating,
  useFloatingTree,
  useFloatingNodeId,
  useFloatingParentNodeId,
  FloatingNode,
  useInteractions,
  offset as fuiOffset,
  flip,
  shift,
  size,
  useHover,
  useClick,
  useRole,
  useDismiss,
  safePolygon,
  useListNavigation,
  useTypeahead,
  useMergeRefs,
  autoUpdate,
  arrow as fuArrow,
  UseFloatingReturn,
  FloatingTree,
  Strategy
} from "@floating-ui/react";

// utils
import merge from "deepmerge";

// context
import { useTailwindTheme, useRtl } from "../../theme";
import { MenuContextProvider } from "./MenuContext";
// types
import type {
  Handler,
  Placement,
  OffsetProps,
  AnimationProps,
  MenuDismissProps,
  ArrowProps
} from "../../types/components/menu";
import { isElement } from "../../utils";
import { useSize } from "../../hooks/use-size";
import { transformOrigin } from "../../lib/helpers/origin";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";


export interface MenuProps<T=HTMLElement|null>{
  open?: boolean;
  handler?: Handler;
  placement?: Placement;
  offset?: OffsetProps;
  dismiss?: MenuDismissProps;
  animate?: AnimationProps;
  lockScroll?: boolean;
  children: React.ReactNode;
  allowHover?: boolean;
  arrow?: ArrowProps | boolean;
  target?: React.MutableRefObject<T> | T | null;
  nav?:boolean;
  disablePortal?:boolean;
  strategy?: Strategy;
}

export const Menu = React.forwardRef<
  HTMLButtonElement, 
  MenuProps
>(
  (
    { children, ...props },
    ref,
  ) => {
    // 1. init
    const parentId = useFloatingParentNodeId();

    // 2. return
    if (parentId == null) {
      return (
        <FloatingTree>
          <MenuCore ref={ref as any} {...props}>
            {children}
          </MenuCore>
        </FloatingTree>
      );
    }

    return (
      <MenuCore ref={ref as any} {...props}>
        {children}
      </MenuCore>
    );
  },
);

Menu.displayName = "Mux.Menu";

export const MenuCore = React.forwardRef<
  HTMLButtonElement,
  MenuProps
>(
  (
    { open, 
      handler, 
      placement, 
      offset, 
      dismiss, 
      animate, 
      lockScroll, 
      allowHover, 
      arrow = false, 
      target,
      strategy:strategyProp="fixed",
      nav = true,
      disablePortal,
      children ,

    },
    ref,
  ) => {
    // 1. init
    const { menu } = useTailwindTheme();
    const { defaultProps, styles } = menu;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [internalAllowHover, setInternalAllowHover] = React.useState(false);
    const arrowRef = React.useRef<any>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const enableAnimate = prefersReducedMotion ? false : !!animate;
    
    // 2. set default props
    open = open ?? internalOpen;
    handler = handler ?? setInternalOpen;
    //placement = placement ?? defaultProps.placement;
    offset = offset ?? defaultProps.offset;
    dismiss = dismiss ?? defaultProps.dismiss;
    animate = animate ?? defaultProps.animate;
    lockScroll = lockScroll ?? defaultProps.lockScroll;
    let arrowProps  = typeof arrow !== 'boolean' ?  arrow : defaultProps.arrow;

    const showArrow = typeof arrow === 'boolean' ? arrow : !!arrowProps;
    
    if (showArrow === false) {
        arrowProps = undefined;
    } else if (showArrow) {
        arrowProps = merge(defaultProps.arrow ?? styles.base.defaultArrow, arrowProps ?? {});
    }
    
    
    // 4. set @floating-ui
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const listItemsRef = React.useRef<Array<HTMLButtonElement | null>>([]);
    const listContentRef = React.useRef(
      React.Children.map(children, (child) =>
        React.isValidElement(child) ? child.props.label : null,
      ) as Array<string | null>,
    );

    const arrowSize = useSize(arrowRef.current);
    const arrowWidth = arrowSize?.width ?? 0;
    const arrowHeight = arrowSize?.height ?? 0;

    const tree = useFloatingTree();
    const nodeId = useFloatingNodeId();
    const parentId = useFloatingParentNodeId();
    const rtl = useRtl();
    const nested = parentId != null;
    placement = placement ?? (nested ? (rtl ? 'left-start' : 'right-start') : 'bottom')
    const { x, y, strategy, refs, context } = useFloating<HTMLButtonElement>({
      open,
      nodeId,
      placement: placement,
      strategy: strategyProp,
      onOpenChange: handler,
      middleware: [
        fuiOffset(offset), 
        flip(), 
        shift(), 
        showArrow && fuArrow({
          element: arrowRef,
          padding: arrowProps?.padding ?? 5,
        }),
        enableAnimate && transformOrigin({ arrowWidth, arrowHeight }),
        size({
            apply: ({ elements, rects, availableWidth, availableHeight }) => {
              const { width: anchorWidth, height: anchorHeight } = rects.reference;
              const contentStyle = elements.floating.style;
              contentStyle.setProperty('--popper-available-width', `${availableWidth}px`);
              contentStyle.setProperty('--popper-available-height', `${availableHeight}px`);
              contentStyle.setProperty('--popper-anchor-width', `${anchorWidth}px`);
              contentStyle.setProperty('--popper-anchor-height', `${anchorHeight}px`);
            },
          }),
      ],
      whileElementsMounted: autoUpdate,

      elements: target ? {
         reference: isElement(target) ? target : target?.current
      } : undefined
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
      useHover(context, {
        handleClose: safePolygon({
          
          blockPointerEvents: true,
        }),
        restMs: 25,
        enabled: allowHover ?? (nested && internalAllowHover),
        delay: { open: 75 },
      }),
      useClick(context, {
        toggle: !nested || !internalAllowHover,
        event: !nested ? "click" : "mousedown",
        ignoreMouse: nested,
      }),
      useRole(context, { role: "menu" }),
      useDismiss(context, dismiss),
      nav 
      ? useListNavigation(context, {
        listRef: listItemsRef,
        activeIndex,
        nested,
        onNavigate: setActiveIndex,
        rtl
      }) : undefined,
      nav
      ? useTypeahead(context, {
        listRef: listContentRef,
        onMatch: open ? setActiveIndex : undefined,
        activeIndex,
      })
      : undefined,
    ]);

    React.useEffect(() => {
      function handleTreeClick() {
        if (dismiss?.itemPress) handler?.(false);
      }

      function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
        if (event.nodeId !== nodeId && event.parentId === parentId) {
          handler?.(false);
        }
      }

      tree?.events.on("click", handleTreeClick);
      tree?.events.on("menuopen", onSubMenuOpen);

      return () => {
        tree?.events.off("click", handleTreeClick);
        tree?.events.off("menuopen", onSubMenuOpen);
      };
    }, [tree, nodeId, parentId, handler, dismiss]);

    React.useEffect(() => {
      if (open) {
        tree?.events.emit("menuopen", {
          parentId,
          nodeId,
        });
      }
    }, [tree, open, nodeId, parentId]);

    React.useEffect(() => {
      function onPointerMove({ pointerType }: PointerEvent) {
        if (pointerType !== "touch") {
          setInternalAllowHover(true);
        }
      }

      function onKeyDown() {
        setInternalAllowHover(false);
      }

      window.addEventListener("pointermove", onPointerMove, {
        once: true,
        capture: true,
      });

      window.addEventListener("keydown", onKeyDown, true);
      return () => {
        window.removeEventListener("pointermove", onPointerMove, {
          capture: true,
        });

        window.removeEventListener("keydown", onKeyDown, true);
      };
    }, [internalAllowHover]);

    //const referenceRef = useMergeRefs([refs.setReference, ref]);

    const contextValue = React.useMemo(
      () => ({
        open,
        handler,
        setInternalOpen,
        strategy,
        x,
        y,
        reference: refs.setReference,
        floating: refs.setFloating,
        listItemsRef,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        animate: enableAnimate,
        lockScroll,
        context,
        activeIndex,
        tree,
        allowHover,
        internalAllowHover,
        nested,
        setActiveIndex,
        rtl,
        placement,
        arrow: arrowProps,
        arrowRef,
        disablePortal,
        nav
      }),
      [
        open,
        handler,
        setInternalOpen,
        strategy,
        x,
        y,
        //referenceRef,
        refs,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        enableAnimate,
        context,
        activeIndex,
        tree,
        allowHover,
        internalAllowHover,
        nested,
        setActiveIndex,
        placement,
        arrowRef
      ],
    );

    

    // 5. return
    return (
      <MenuContextProvider value={contextValue as any}>
        <FloatingNode id={nodeId}>{children}</FloatingNode>
      </MenuContextProvider>
    );

  },
);


MenuCore.displayName = "Mux.MenuCore";




export default Menu;
