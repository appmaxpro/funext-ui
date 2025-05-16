"use client";
import React, { KeyboardEvent, useContext, useImperativeHandle } from "react";

// @floating-ui
import {
  FloatingOverlay,
  FloatingFocusManager,
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
  Strategy,
  FloatingArrow,
  FloatingContext,
  ReferenceType,
  UseInteractionsReturn,
  FloatingTree,
  FloatingTreeType,
} from "@floating-ui/react";

import { isMenuItemValid, setRef, setValidItemTypes } from "./utils";

// types
import {
  clsx,
  styled,
  StyledComponent,
  SxComponentProps,
  useRtl,
  useTailwindTheme,
  useTheme,
} from "../../styles";
import Panel, { PanelProps } from "../Panel";
import List, { ListItemSuffix, ListProps } from "../List";
import { useForwardedRef, useRefs } from "../../hooks";
import { Presence } from "../../lib/presence";
import { Portal } from "../../lib/portal";

import { MenuContextProps, MenuContextProvider, useMenu } from "./MenuContext";
import { isElement, noop } from "../../utils";

import { useSize } from "../../hooks/use-size";
import { getPlacementSides, transformOrigin } from "../../lib/helpers/origin";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

// types
import type {
  Handler,
  Placement,
  OffsetProps,
  MenuDismissProps,
  ArrowProps,
} from "./types";
import deepmerge from "../../utils/deepmerge";
import { isRecord } from "../../lib/isRecord";
import { ChevronLeft, ChevronRight } from "../internal/svg-icons/chevron";
import { Layer, LayerProvider, useLayer } from "../../lib/layer";
import { DEFAULT_POPPER_ARROW } from "../Popper/constants";
import { getElementRef } from "../../lib/getElementRef";
import { isElementDisabled, isElementHidden } from "../List/utils";
import { getAnimationOrName, shouldForwardProp } from "../internal/animation";
import { EMPTY_RECORD } from "../../lib/constants";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { composeEventHandlers } from "../../hooks/compose-event-handlers";
import { Box } from "@mui/system";
import { BoxProps } from "../Box";
import { createGlobalScopedContext } from "../../lib/createGlobalScopedContext";

const dismissBubbles = {
  bubbles: true,
  itemPress: true,
};

const PanelRoot = styled(Panel, {
  name: "MuxMenu",
  slot: "panel",
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp,
})(
  ({ theme }) => ({
    ...theme.typography.body1,
    boxShadow:
      "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
    willChange: "transform, opacity",
    minWidth: 200,
    borderRadius: 12,
    maxWidth: "var(--popper-available-width)",
    maxHeight: "var(--popper-available-height)",
    borderWidth: 1,
  }),
  getAnimationOrName("fadeScale"),
) as StyledComponent<any>;

const Arrow = styled(FloatingArrow)(({ theme }) => ({
  fill: theme.palette.background.paper,
  willChange: "transform, opacity",
}));

const ListRoot = styled(List, {
  name: "MuxMenu",
  slot: "list",
  overridesResolver: (props, styles) => styles.root,
})({
  overflow: "auto",
  outline: 0,
  borderRadius: "inherit",
  "&:focus-visible": {
    outline: 0,
  },
});

type TriggerProps = Omit<SxComponentProps<"button">, "children"> & {
  children: React.ReactElement | null;
};

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children, ...props }, forwardRef) => {
    return useTrigger({
      children,
      forwardRef,
      ...props,
    });
  },
);

type UseTriggerProps = TriggerProps & {
  forwardRef?: React.ForwardedRef<HTMLButtonElement>;
};

function fn<EventType extends React.SyntheticEvent | Event>(
  fn?: ((event: EventType) => any) | undefined,
) {
  return typeof fn === "function" ? fn : noop;
}

const useTrigger = ({
  children: trigger,
  forwardRef,
  ...rest
}: UseTriggerProps) => {
  const { context, getReferenceProps, nested, rtl } = useMenu();

  const children = trigger as React.ReactElement;

  const nodeRef = React.useRef(null);

  const mergedRef = useMergeRefs([
    context.refs.setReference,
    forwardRef,
    nodeRef,
  ]);

  //console.log("Trigger Ref:", nodeRef)

  if (!trigger) {
    return trigger;
  }

  const onKeyDown = (event: KeyboardEvent) => {
    //children.props.onKeyDown?.(event);
    rest.onKeyDown?.(event as any);

    if (nodeRef.current) {
      if (
        isElementHidden(nodeRef.current) ||
        isElementDisabled(nodeRef.current)
      ) {
        return;
      }

      // Wait until IME is settled.
      if (event.which !== 229) {
        const key = event.key;
        const isArrowKey = event.key.startsWith("Arrow");
        if (!isArrowKey) return;

        //const leftKey = rtl ? "ArrowRight" : "ArrowLeft";
        //const rightKey = rtl ? "ArrowLeft" : "ArrowRight";

        switch (key) {
          case "ArrowRight":
            if (!rtl && nested && !context.open) {
              context.onOpenChange(true, event as any, "list-navigation");
            }
            break;

          case "ArrowLeft":
            if (rtl && nested && !context.open) {
              context.onOpenChange(true, event as any, "list-navigation");
            }
            break;

          case "ArrowDown":
            if (!nested && !context.open) {
              context.onOpenChange(true, event as any, "list-navigation");
            }
            break;
        }
      }
    }
  };

  const mergedProps = { ...children.props, ...rest };

  const ChevronIcon = rtl ? ChevronLeft : ChevronRight;

  const endIcon =
    mergedProps.endIcon ??
    (nested && (
      <ListItemSuffix aria-hidden>
        <ChevronIcon
          size={18}
          className={`transition-transform ${context.open ? (rtl ? "-rotate-90" : "rotate-90") : ""}`}
        />
      </ListItemSuffix>
    ));
  return React.cloneElement(
    children,
    getReferenceProps({
      ...mergedProps,
      endIcon,
      "data-open": context.open ? "open" : undefined,
      role: nested ? "menuitem" : mergedProps.role,
      onClick(event: any) {
        event.stopPropagation();
        //children.props.onClick?.(event);
      },
      onKeyDown: nested
        ? composeEventHandlers(onKeyDown, fn(mergedProps.onKeyDown))
        : (mergedProps.onKeyDown ?? children.props.onKeyDown),
      onFocus: composeEventHandlers(
        fn(mergedProps.onFocus),
        fn(children.props.onFocus),
      ),
      onBlur: composeEventHandlers(
        fn(mergedProps.onBlur),
        fn(children.props.onBlur),
      ),
      ref: mergedRef,
    }),
  );
};

type SubMenuProps = Omit<SxComponentProps<"button">, "children"> & {
  children: React.ReactNode;
};

export const SubMenu = React.forwardRef<HTMLButtonElement, SubMenuProps>(
  ({ children, ...props }, forwardRef) => {
    let menuChildren = React.Children.toArray(children);
    let item = menuChildren.shift();
    //const ref = React.useRef<HTMLButtonElement | null>(null);
    //useImperativeHandle(forwardRef, () => ref.current!);

    return React.isValidElement(menuChildren[0])
      ? React.cloneElement(menuChildren[0] as React.ReactElement, {
          trigger: (
            <Trigger {...props} ref={forwardRef}>
              {React.cloneElement(item as React.ReactElement)}
            </Trigger>
          ),
        })
      : item;
  },
);

export interface MenuProps<T = HTMLElement | null> extends ListProps<"div"> {
  open?: boolean;
  handler?: Handler;
  onOpenChange?: Handler;
  sideOffset?: number;
  alignOffset?: number;
  arrowPadding?: number;
  placement?: Placement;
  offset?: OffsetProps;
  dismiss?: MenuDismissProps;
  animate?: boolean;
  lockScroll?: boolean;
  children: React.ReactNode;
  arrow?: ArrowProps | boolean;
  reference?: React.MutableRefObject<T> | T | null;
  trigger?: React.ReactNode | false;
  navigation?: boolean;
  portal?: boolean;
  strategy?: Strategy;
  zOffset?: number;
  menuProps?: {
    panelProps?: Omit<PanelProps, "children">;
    listProps?: Omit<ListProps, "children">;
    className?: string;
  };
}

const getMenuList = (
  children: React.ReactElement,
  rest: any,
  props?: any,
  ref?: React.ForwardedRef<HTMLDivElement>,
) => {
  if (!children) {
    return children;
  }
  if ((children as any).type === MenuList) {
    return children;
  }
  if (
    Array.isArray(children) &&
    (children.length > 1 ||
      (children.length == 1 && children[0].type !== MenuList))
  ) {
    return (
      <MenuList
        animate={rest.animate}
        arrow={rest.arrow}
        className={rest.className}
        {...props}
        ref={ref}
      >
        {children}
      </MenuList>
    );
  }
  return children;
};

const Menu = React.forwardRef<
  HTMLDivElement,
  MenuProps & { $internal?: boolean }
>((inProps, ref) => {
  const { $internal, ...props } = inProps;
  // 1. init
  const parentId = useFloatingParentNodeId();
  const nested = parentId != null;

  // 2. return
  if (parentId == null && !$internal) {
    return (
      <FloatingTree>
        <Menu {...props} $internal={true} ref={ref} />
      </FloatingTree>
    );
  }

  let { children, trigger, menuProps, ...rest } = props;

  if (!rest.reference && trigger !== false) {
    let menuChildren = React.Children.toArray(children);
    let nestedTrigger = false;
    if ((trigger as any)?.type !== Trigger) {
      nestedTrigger = true;      
      trigger = (
        <Trigger ref={ref as any}>{(trigger ??= menuChildren.shift()) as React.ReactElement}</Trigger>
      );
      children = menuChildren as unknown as React.ReactElement;
      if (nested) {
        console.log("Menu nested: children:", children);
        return (
          <MenuInner 
            {...rest}
            trigger={trigger}>
              {getMenuList(children, rest, menuProps)}
            </MenuInner>
        );
      }

      
      return (
        <MenuInner {...rest} trigger={trigger}>
          {getMenuList(children, rest, menuProps)}
        </MenuInner>
      );
    }
  }

  return (
    <MenuInner {...props}>
      {getMenuList(children as React.ReactElement, props, menuProps, ref)}
    </MenuInner>
  );
});

const MenuInner: React.FC<Partial<MenuProps>> = ({
  open: openProps,
  handler,
  onOpenChange: onOpenChangeProps = handler,
  sideOffset = 0,
  alignOffset = 0,
  arrowPadding = 5,
  placement,
  offset,
  dismiss: dismissProps = dismissBubbles,
  animate: animateProps = true,
  lockScroll,
  arrow: arrowProps = false,
  reference,
  strategy: strategyProp = "fixed",
  navigation = true,
  portal = true,
  children,
  trigger,
  zOffset,
}) => {
  // 1. init
  const { menu } = useTailwindTheme();
  const { defaultProps, styles } = menu;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [hasFocusInside, setHasFocusInside] = React.useState(false);

  const arrowRef = React.useRef<any>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = animateProps ?? prefersReducedMotion;

  // 2. set default props
  const open = openProps ?? internalOpen;
  const onOpenChange =
    typeof onOpenChangeProps == "function"
      ? onOpenChangeProps
      : setInternalOpen;
  //placement = placement ?? defaultProps.placement;
  offset = offset ?? defaultProps.offset;
  lockScroll = lockScroll ?? defaultProps.lockScroll;
  const theme = useTheme();
  zOffset ??= theme.zIndex.modal;

  const arrow = isRecord(arrowProps)
    ? arrowProps
    : arrowProps === true
      ? (defaultProps.arrow ?? DEFAULT_POPPER_ARROW)
      : undefined;

  // 4. set @floating-ui
  const [allowHover, setAllowHover] = React.useState(true);
  //const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const arrowSize = useSize(arrowRef.current);
  const arrowWidth = arrowSize?.width ?? 0;
  const arrowHeight = arrowSize?.height ?? 0;
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const rtl = useRtl();
  const nested = parentId != null;

  //console.log("MenuInner: nested:", nested);

  placement =
    placement ?? (nested ? (rtl ? "left-start" : "right-start") : "bottom");
  const { refs, context } = useFloating<HTMLButtonElement>({
    open,
    nodeId,
    placement: placement,
    strategy: strategyProp,
    onOpenChange: useCallbackRef(onOpenChange),

    middleware: [
      fuiOffset(
        offset ?? {
          mainAxis: nested ? 0 : sideOffset + arrowHeight,
          alignmentAxis: nested ? 0 : alignOffset,
        },
      ),
      flip(),
      shift(),
      arrow &&
        !nested &&
        fuArrow({
          element: arrowRef,
          padding: arrowPadding,
        }),
      animate && transformOrigin({ arrowWidth, arrowHeight }),
      size({
        apply: ({ elements, rects, availableWidth, availableHeight }) => {
          const { width: anchorWidth, height: anchorHeight } = rects.reference;
          const contentStyle = elements.floating.style;
          contentStyle.setProperty(
            "--popper-available-width",
            `${availableWidth}px`,
          );
          contentStyle.setProperty(
            "--popper-available-height",
            `${availableHeight}px`,
          );
          contentStyle.setProperty(
            "--popper-reference-width",
            `${anchorWidth}px`,
          );
          contentStyle.setProperty(
            "--popper-reference-height",
            `${anchorHeight}px`,
          );
        },
      }),
    ],
    whileElementsMounted: autoUpdate,

    elements: reference
      ? {
          reference: isElement(reference) ? reference : reference?.current,
        }
      : undefined,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useHover(context, {
        enabled: nested && allowHover,
        delay: { open: 75 },
        handleClose: safePolygon({
          blockPointerEvents: true,
        }),
      }),
      useClick(context, {
        toggle: !nested || allowHover,
        event: !nested ? "click" : "mousedown",
        ignoreMouse: nested,
      }),
      useRole(context, { role: "menu" }),
      useDismiss(context, dismissProps),
    ],
  );

  const contextValue = React.useMemo(
    () => ({
      context,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      allowHover,
      setAllowHover,
      arrowRef,
      navigation,
      nested,
      rtl,
      dismissOnItemClick: dismissProps?.itemPress,
    }),
    [
      context,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      allowHover,
      setAllowHover,
      nested /*activeIndex, setActiveIndex*/,
      dismissProps?.itemPress,
      arrowRef,
      refs.domReference,
    ],
  );
  console.log(
    "Menu floating:",
    refs.floating,
    ", isPositioned:",
    context.isPositioned,
  );
  // 5. return
  return (
    <MenuContextProvider value={contextValue as any}>
      <FloatingNode id={nodeId}>
        {trigger}
        <Presence animate={animate} present={open}>
          <MenuPortal
            //={present}
            lockScroll={lockScroll && !nested}
            portal={portal}
          >
            <LayerProvider zOffset={zOffset}>{children}</LayerProvider>
          </MenuPortal>
        </Presence>
      </FloatingNode>
    </MenuContextProvider>
  );
};

export const MenuPortalContext =
  createGlobalScopedContext<null | React.ForwardedRef<HTMLElement>>(
    "@funext/ui/context/menu/portal",
    null,
  );

interface MenuPortalProps {
  lockScroll?: boolean;
  portal: boolean;
  //present: boolean;
  children: React.ReactNode;
}
const MenuPortal = React.forwardRef<HTMLElement, MenuPortalProps>(
  (props, ref) => {
    const { lockScroll, children, portal } = props;
    let child = (
      <MenuPortalContext.Provider value={ref}>
        {children}
      </MenuPortalContext.Provider>
    );
    if (portal) {
      child = (
        <Portal floatingPortal>
          {lockScroll && <FloatingOverlay lockScroll />}
          {child}
        </Portal>
      );
    }
    return child;
  },
);

const MenuRoot = React.forwardRef<
  HTMLDivElement,
  BoxProps & { getFloatingProps?: MenuContextProps["getFloatingProps"] }
>((props, forwardRef) => {
  const { context, getFloatingProps: floatingPropsFn, navigation } = useMenu();
  const { open, placement, floatingStyles, middlewareData } = context;
  const [side, align] = getPlacementSides(placement);
  const { zIndex } = useLayer();

  const { children, getFloatingProps = floatingPropsFn, ...rest } = props;
  const ref = useRefs(forwardRef, context.refs.setFloating);
  return (
    <Box
      data-ui="Menu"
      data-state={open ? "open" : "close"}
      data-side={side}
      data-align={align}
      ref={ref}
      {...getFloatingProps({
        ...(rest as any),
        onKeyDown(event) {
          if (event.key === "Tab" && !navigation) {
            context.onOpenChange(false, event as unknown as Event);
            if (event.shiftKey) {
              event.preventDefault();
            }
          }
        },
        style: {
          ...floatingStyles,
          outline: 0,
          transform: floatingStyles.transform, // keep off the page when measuring
          minWidth: "max-content",
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
          zIndex,
          ...props.style,
        },
      })}
    >
      {children}
    </Box>
  );
});

interface MenuListProps extends ListProps<"div"> {
  children: React.ReactNode;
  arrow?: ArrowProps | true;
  animate?: boolean;
  panelProps?: Omit<PanelProps, "children">;
  panelRef: React.ForwardedRef<HTMLElement>;
  wrapRoot?: boolean;
}

const MenuList = React.forwardRef<HTMLDivElement, MenuListProps>(
  (props, forwardRef) => {
    const {
      children,
      className,
      arrow: arrowProps,
      animate,
      panelProps,
      wrapRoot = true,
      ...rest
    } = props;

    const tree = useFloatingTree();
    const parentId = useFloatingParentNodeId();
    const rtl = useRtl();
    const {
      context,
      getFloatingProps: floatingPropsFn,
      getItemProps: temPropsFn,
      navigation: nav,
      closeOnItemClick,
      allowHover,
      setAllowHover,
      arrowRef,
    } = useMenu();

    const panelRef = useContext(MenuPortalContext)

    const nested = parentId != null;

    const { open, nodeId } = context;

    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const listItemsRef = React.useRef<
      Array<HTMLButtonElement | HTMLElement | null>
    >([]);
    const listContentRef = React.useRef(
      React.Children.map(children, (child) =>
        React.isValidElement(child) ? child.props.label : null,
      ) as Array<string | null>,
    );

    const arrow = isRecord(arrowProps)
      ? arrowProps
      : arrowProps === true
        ? DEFAULT_POPPER_ARROW
        : undefined;

    const { getFloatingProps, getItemProps } = useInteractions([
      
      //useRole(context, { role: "menu" }),
      nav
        ? useListNavigation(context, {
            listRef: listItemsRef,
            activeIndex,
            nested,
            onNavigate: setActiveIndex,
            rtl,
            loop: true,
          })
        : undefined,
      nav
        ? useTypeahead(context, {
            listRef: listContentRef,
            onMatch: setActiveIndex,
            activeIndex,
          })
        : undefined,
      {
        floating: floatingPropsFn?.({} as React.HTMLProps<HTMLElement>),
        item: temPropsFn?.({} as React.HTMLProps<HTMLElement>),
      },
    ]);

    React.useEffect(() => {
      function handleTreeClick(event: Event) {
        if (closeOnItemClick) context.onOpenChange(false, event);
      }

      function onSubMenuOpen(
        event: { nodeId: string; parentId: string } & Event,
      ) {
        if (event.nodeId !== nodeId && event.parentId === parentId) {
          context.onOpenChange(false, event);
        }
      }

      tree?.events.on("click", handleTreeClick);
      tree?.events.on("menuopen", onSubMenuOpen);

      return () => {
        tree?.events.off("click", handleTreeClick);
        tree?.events.off("menuopen", onSubMenuOpen);
      };
    }, [tree, nodeId, parentId]);

    React.useEffect(() => {
      tree?.events.emit("menuopen", {
        parentId,
        nodeId,
      });
    }, [tree, open, nodeId, parentId]);

    // Determine if "hover" logic can run based on the modality of input. This
    // prevents unwanted focus synchronization as menus open and close with
    // keyboard navigation and the cursor is resting on the menu.
    React.useEffect(() => {
      function onPointerMove({ pointerType }: PointerEvent) {
        if (pointerType !== "touch") {
          setAllowHover(true);
        }
      }

      function onKeyDown() {
        setAllowHover(false);
      }

      window.addEventListener("pointermove", onPointerMove, {
        once: true,
        capture: true,
      });

      window.addEventListener("keydown", onKeyDown, true);
      setAllowHover(false);
      return () => {
        window.removeEventListener("pointermove", onPointerMove, {
          capture: true,
        });

        window.removeEventListener("keydown", onKeyDown, true);

        setAllowHover(true);
      };
    }, [setAllowHover]);

    const ref = useRefs(forwardRef, wrapRoot ? undefined : panelRef);

    const items = !nav
      ? children
      : React.Children.map(
          children,
          (child: any, index) =>
            React.isValidElement(child) &&
            (!isMenuItemValid(child)
              ? React.cloneElement(child, {
                  "aria-disabled": "true",
                  className: clsx(
                    (child.props as any).className,
                    "item-disabled",
                  ),
                  ref(node: HTMLElement) {
                    listItemsRef.current[index] = null;
                  },
                } as any)
              : React.cloneElement(child, {
                  //@ts-ignore
                  "data-item": "",
                  //@ts-ignore
                  "area-active": activeIndex === index ? "true" : undefined,
                  ...getItemProps({
                    tabIndex: activeIndex === index ? 0 : -1,
                    role: "menuitem",
                    ref(node: HTMLButtonElement) {
                      listItemsRef.current[index] = node;
                      //console.log("MenuItemRef: ", node, ", index:", index)
                    },
                    onClick(event) {
                      (child.props as any).onClick?.(event);
                      tree?.events.emit("click");
                    },
                    onMouseEnter() {
                      if (allowHover) {
                        setActiveIndex(index);
                      }
                    },
                    onFocus(event) {
                      (child.props as any).onFocus?.(event);
                      //setHasFocusInside(true);
                    },
                  }),
                })),
        );

    const [side, align] = getPlacementSides(context.placement);

    const panel = (
      <PanelRoot
        data-state={open ? "open" : "close"}
        data-ui="MenuListPanel"
        animate={animate}
        fill
        {...panelProps}
        ref={wrapRoot ? panelRef : ref}
      >
        <ListRoot
          className={className}
          role="menu"
          data-ui="MenuList"
          tabIndex={-1}
          {...rest}
        >
          {items}
        </ListRoot>

        {arrow && (
          <Arrow
            {...arrow}
            ref={arrowRef as any}
            context={context}
            data-state={open ? "open" : "close"}
            data-ui="MenuArrow"
          />
        )}
      </PanelRoot>
    );

    const child = !nav ? (
      panel
    ) : (
      <FloatingFocusManager
        context={context}
        // Prevent outside content interference.
        //modal={false}
        // Only initially focus the root floating menu.
        initialFocus={0}
        // Only return focus to the root menu's reference when menus close.
        returnFocus={nested}
        //guards={false}
      >
        {panel}
      </FloatingFocusManager>
    );

    if (wrapRoot) {
      return (
        <MenuRoot getFloatingProps={getFloatingProps} ref={forwardRef}>
          {child}
        </MenuRoot>
      );
    }

    return child;
  },
);

//const isArrowKey = event.key.startsWith('Arrow');
setValidItemTypes(Menu);
setValidItemTypes(SubMenu);
setValidItemTypes(Trigger);

type MenuType = React.FC<MenuProps> & {
  Sub: typeof SubMenu;
  DropDown: typeof SubMenu;
  Trigger: typeof SubMenu;
};

const Root: MenuType = Object.assign(Menu, {
  Sub: SubMenu,
  DropDown: SubMenu,
  Trigger: Trigger,
}) as MenuType;

Menu.displayName = "Mux.Menu";
SubMenu.displayName = "Mux.MenuDropDown";
Trigger.displayName = "Mux.MenuTrigger";
MenuList.displayName = "Mux.MenuList";

export type { TriggerProps, SubMenuProps };

export { Root as Menu };
