"use client";
import React from "react";

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
} from "@floating-ui/react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

import { isMenuItemValid } from "./utils";

// types
import {
  clsx,
  styled,
  StyledComponent,
  SxComponentProps,
  useRtl,
  useTailwindTheme,
} from "../../styles";
import Panel, { PanelProps } from "../Panel";
import List, { ListItemSuffix, ListProps } from "../List";
import { useRefs } from "../../hooks";
import { Presence } from "../../lib/presence";
import { scaleFadeStyle } from "../internal/animation";
import { Portal } from "../../lib/portal";

import { MenuContextProvider } from "./MenuContext";
import { isElement } from "../../utils";

import { useSize } from "../../hooks/use-size";
import { transformOrigin } from "../../lib/helpers/origin";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

// types
import type {
  Handler,
  Placement,
  OffsetProps,
  MenuDismissProps,
  ArrowProps,
} from "../../types/components/menu";
import deepmerge from "../../utils/deepmerge";
import { isRecord } from "../../lib/isRecord";
import { ChevronLeft, ChevronRight } from "../internal/svg-icons/chevron";
import { Layer } from "../../lib/layer";

const dismissBubbles = { bubbles: true };

const PanelRoot = styled(Panel, {
  name: "MuxMenu",
  slot: "panel",
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (propName) => propName !== "animate",
})(
  ({ theme }) => ({
    ...theme.typography.body1,
    boxShadow:
      "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
    willChange: "transform, opacity",
    minWidth: 200,
    borderRadius: 6,
    maxHeight: "var(--popper-available-height)",
  }),
  scaleFadeStyle,
) as StyledComponent<any>;

const Arrow = styled(FloatingArrow)(({ theme }) => ({
  fill: theme.palette.background.paper,
}));

const MenuListRoot = styled(List, {
  name: "MuxMenu",
  slot: "list",
  overridesResolver: (props, styles) => styles.root,
})({
  overflow: "auto",
  borderRadius: "inherit",
  "&:focus-visible": {
    outline: 0,
  },
});

export interface MenuProps<T = HTMLElement | null> extends ListProps {
  open?: boolean;
  handler?: Handler;
  placement?: Placement;
  offset?: OffsetProps;
  dismiss?: MenuDismissProps;
  animate?: boolean;
  lockScroll?: boolean;
  children: React.ReactNode;
  arrow?: ArrowProps | boolean;
  reference?: React.MutableRefObject<T> | T | null;
  trigger?: React.ReactNode | false;
  nav?: boolean;
  portal?: boolean;
  strategy?: Strategy;
  panelProps?: Omit<PanelProps, "children">;
  listProps?: Omit<ListProps, "children">;
}

export const Menu = React.forwardRef<HTMLButtonElement, MenuProps>(
  (
    {
      open,
      handler,
      placement,
      offset,
      dismiss = dismissBubbles,
      animate: animateProps,
      lockScroll,
      arrow:arrowProps = false,
      reference,
      strategy: strategyProp = "fixed",
      nav = true,
      portal = true,
      children,
      className,
      panelProps,
      listProps,
      trigger,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { menu } = useTailwindTheme();
    const { defaultProps, styles } = menu;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [hasFocusInside, setHasFocusInside] = React.useState(false);


    const arrowRef = React.useRef<any>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const animate = prefersReducedMotion ? false : animateProps ?? defaultProps.animate;

    // 2. set default props
    open = open ?? internalOpen;
    handler = handler ?? setInternalOpen;
    //placement = placement ?? defaultProps.placement;
    offset = offset ?? defaultProps.offset;
    dismiss = dismiss ?? defaultProps.dismiss;
    lockScroll = lockScroll ?? defaultProps.lockScroll;

    const arrow = isRecord(arrowProps)
                 ? arrowProps 
                 : arrowProps === true 
                 ? defaultProps.arrow 
                 : undefined;

    // 4. set @floating-ui
    const [allowHover, setAllowHover] = React.useState(false);
    //const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const arrowSize = useSize(arrowRef.current);
    const arrowWidth = arrowSize?.width ?? 0;
    const arrowHeight = arrowSize?.height ?? 0;

    const nodeId = useFloatingNodeId();
    const parentId = useFloatingParentNodeId();
    const rtl = useRtl();
    const nested = parentId != null;
    placement =
      placement ?? (nested ? (rtl ? "left-start" : "right-start") : "bottom");
    const { refs, context } = useFloating<HTMLButtonElement>({
      open,
      nodeId,
      placement: placement,
      strategy: strategyProp,
      onOpenChange: handler,
      middleware: [
        fuiOffset(offset),
        flip(),
        shift(),
        arrow &&
          !nested &&
          fuArrow({
            element: arrowRef,
            padding: arrow.padding ?? 5,
          }),
        animate && transformOrigin({ arrowWidth, arrowHeight }),
        size({
          apply: ({ elements, rects, availableWidth, availableHeight }) => {
            const { width: anchorWidth, height: anchorHeight } =
              rects.reference;
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

    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([
        useHover(context, {
          enabled: nested && allowHover,
          delay: { open: 75 },
          handleClose: safePolygon({
            blockPointerEvents: true,
          }),
        }),
        useClick(context, {
          toggle: !nested || !allowHover,
          event: !nested ? "click" : "mousedown",
          ignoreMouse: nested,
        }),
        useRole(context, { role: "menu" }),
        useDismiss(context, dismiss),
      ]);

    const referenceRef = useMergeRefs([refs.setReference, ref]);

    const contextValue = React.useMemo(
      () => ({
        context,
        allowHover,
        nested,
        //activeIndex,
        //setActiveIndex,
      }),
      [context, allowHover, nested /*activeIndex, setActiveIndex*/],
    );

    //m(Panel);
    const [initialized, setInitialized] = React.useState(false);

    let menuChildren = React.Children.toArray(children);

    if (trigger != false) {
      trigger ??= menuChildren.shift();
    }

    React.useEffect(() => {
      if (open && !initialized) {
        setInitialized(true);
      }
    }, [open, initialized]);

    if (!initialized && !nested) {
      //console.log("!initialized");
      return null;
    }

    // 6. menu component.

    const render = (ref: any) => {
      // 2. set default props
      className = className ?? menu.defaultProps.className;

      return (
        <MenuList
          {...listProps}
          context={context}
          dismiss={dismiss}
          nav={nav}
          children={menuChildren}
          setAllowHover={setAllowHover}
          allowHover={allowHover}
          getFloatingProps={getFloatingProps}
          getItemProps={getItemProps}
          arrow={arrow}
          arrowRef={arrowRef}
          lockScroll={lockScroll}
          panelProps={panelProps}
          ref={ref}
        />
      );
    };

    const triggerProps = (trigger as any)?.props;
    const endIcon =  triggerProps?.endIcon  ;
    const ChevronIcon = rtl ? ChevronLeft : ChevronRight;
    // 5. return
    return (
      <MenuContextProvider value={contextValue as any}>
        <FloatingNode id={nodeId}>
          {trigger &&
            React.cloneElement(
              trigger as any,
              getReferenceProps({
                ...triggerProps,
                ref: referenceRef,
                onFocus(event) {
                  triggerProps.onFocus?.(event);
                  setHasFocusInside(false);
                },
                onClick(event) {
                  event.stopPropagation();
                },
                'data-open':open ? 'open' : undefined,
                'data-nested':open && nested ? (hasFocusInside ? 'focus': 'open') : undefined,
                ...(nested && {
                  // Indicates this is a nested <Menu /> acting as a <MenuItem />.
                  role: "menuitem",
                }),
                endIcon: endIcon ?? (nested && 
                  <ListItemSuffix aria-hidden>
                      <ChevronIcon className={`transition-transform ${open ? "rotate-90" : ""}`}/>
                  </ListItemSuffix>
                ),
              }),
            )}
          <Presence animate={animate} present={open}>
            {({ present }) => (
              <MenuPortal
                present={present}
                lockScroll={lockScroll && !nested}
                portal={portal}
                render={render}
                ref={refs.setFloating}
              />
            )}
          </Presence>
        </FloatingNode>
      </MenuContextProvider>
    );
  },
);

interface MenuPortalProps {
  lockScroll?: boolean;
  portal: boolean;
  present: boolean;
  render: (ref: React.ForwardedRef<HTMLElement>) => React.ReactNode | null;
}
const MenuPortal = React.forwardRef<HTMLElement, MenuPortalProps>(
  (props, ref) => {
    const { lockScroll, present, render, portal } = props;
    if (present) {
      let child = render(ref);
      if (portal) {
        child = (
          <Portal floatingPortal>
            {lockScroll && <FloatingOverlay lockScroll />}
            {child}
          </Portal>
        );
      }
      return child;
    }

    return null;
  },
);

const StyledLayer = styled(Layer, {
  shouldForwardProp: (propName) => propName !== "animate"
})("");

interface MenuListProps extends ListProps {
  context: FloatingContext<ReferenceType>;
  nav?: boolean;
  children: React.ReactNode;
  dismiss?: MenuDismissProps;
  setAllowHover: React.Dispatch<React.SetStateAction<boolean>>;
  allowHover: boolean;
  getFloatingProps?: UseInteractionsReturn["getFloatingProps"];
  getItemProps?: UseInteractionsReturn["getItemProps"];
  lockScroll?: boolean;
  arrow?: ArrowProps;
  arrowRef: any;
  panelProps?: Omit<PanelProps, "children">;
  animate?: boolean;
}

const MenuList = React.forwardRef<HTMLElement, MenuListProps>((props, ref) => {
  const {
    context,
    nav,
    dismiss,
    setAllowHover,
    allowHover,
    getFloatingProps: menuFloatingProps,
    getItemProps: menuItemProps,
    children,
    className,
    arrow,
    lockScroll,
    arrowRef,
    panelProps,
    animate,
    ...rest
  } = props;
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const rtl = useRtl();
  const nested = parentId != null;

  const { open, middlewareData, refs, floatingStyles } = context;

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const listItemsRef = React.useRef<
    Array<HTMLButtonElement | HTMLElement | null>
  >([]);
  const listContentRef = React.useRef(
    React.Children.map(children, (child) =>
      React.isValidElement(child) ? child.props.label : null,
    ) as Array<string | null>,
  );

  const { getFloatingProps, getItemProps } = useInteractions([
    //useRole(context, { role: "menu" }),
    nav
      ? useListNavigation(context, {
          listRef: listItemsRef,
          activeIndex,
          nested,
          onNavigate: setActiveIndex,
          rtl,
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
      floating: menuFloatingProps?.({} as React.HTMLProps<HTMLElement>),
      item: menuItemProps?.({} as React.HTMLProps<HTMLElement>),
    },
  ]);

  React.useEffect(() => {
    function handleTreeClick(event: Event) {
      if (dismiss?.itemPress) context.onOpenChange(false, event);
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
  }, [tree, nodeId, parentId, dismiss]);

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
    return () => {
      window.removeEventListener("pointermove", onPointerMove, {
        capture: true,
      });

      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [setAllowHover]);

  const mergedRef = useRefs(ref, refs.setFloating);

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
                "area-active": activeIndex === index ? "true" : undefined,
                ...getItemProps({
                  tabIndex: activeIndex === index ? 0 : -1,
                  role: "menuitem",
                  ref(node: HTMLButtonElement) {
                    listItemsRef.current[index] = node;
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

  const child = !nav ? (
    <MenuListRoot
      className={className}
      role="menu"
      data-ui="MenuList"
      {...rest}
    >
      {items}
    </MenuListRoot>
  ) : (
    <FloatingFocusManager
      context={context}
      modal={lockScroll && !nested}
      initialFocus={nested ? -1 : 0}
      returnFocus={!nested}
      visuallyHiddenDismiss
    >
      <MenuListRoot
        className={className}
        role="menu"
        data-ui="MenuList"
        {...rest}
      >
        {items}
      </MenuListRoot>
    </FloatingFocusManager>
  );
  const menuComponent = (
    <div
      data-state={open ? "open" : "close"}
      data-ui="Menu"
      ref={mergedRef as any}
      {...getFloatingProps({
        onKeyDown(event) {
          if (event.key === "Tab" && !nav) {
            context.onOpenChange(false, event as unknown as Event);
            if (event.shiftKey) {
              event.preventDefault();
            }
          }
        },
        style: {
          ...floatingStyles,
          transform: context.isPositioned
            ? floatingStyles.transform
            : "translate(0, -200%)", // keep off the page when measuring
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
        },
      })}
    >
      <PanelRoot
        variant="outlined"
        data-state={open ? "open" : "close"}
        data-ui="MenuListPanel"
        animate={animate}
        fill
        {...panelProps}
      >
        {child}
      </PanelRoot>
      {arrow && (
        <Arrow
          {...(arrow as any)?.props}
          ref={arrowRef as any}
          context={context}
          data-state={open ? "open" : "close"}
          data-ui="MenuArrow"
        />
      )}
    </div>
  );

  return menuComponent;
});


