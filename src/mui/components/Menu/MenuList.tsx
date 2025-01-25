"use client";
import React, { useEffect, useMemo, useRef } from "react";

// @floating-ui
import {
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useMergeRefs,
  Side,
  useTransitionStyles,
} from "@floating-ui/react";

// framer-motion
import {
  AnimatePresence,
  m,
  LazyMotion,
  domAnimation,
  createDomMotionComponent,
  cubicBezier,
  transform,
} from "framer-motion";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { FocusTrap, ArrowNavigation } from "../Focus";
import { useTailwindTheme } from "../../theme";
import { useMenu } from "./MenuContext";
import { isMenuItemValid, isValidItemType, pickAnimation } from "./utils";

// types
import type { NewAnimatePresenceProps } from "../../types/generic";

import { clsx, styled, StyledComponent, useRtl } from "../../styles";
import Panel, { PanelProps } from "../Panel";
import List, { ListProps } from "../List";
import { FloatingArrow, getArrowOrigin } from "../Popover/FloatingArrow";
import { useRefs } from "../../hooks";
import { SxBox } from "../Box";

const PanelRoot = styled(Panel, {
  name: "MuxMenu",
  slot: "panel",
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  ...theme.typography.body1,
})) as StyledComponent<any>;

const MenuListRoot = styled(List, {
  name: "MuxMenu",
  slot: "list",
  overridesResolver: (props, styles) => styles.root,
})({
  overflow: "auto",
  borderRadius: "inherit",
});

export interface MenuListProps extends ListProps {
  dismissible?: boolean;
  panelClassName?: string;
  nav?: boolean;
  children?: React.ReactNode;
  panelProps?: Omit<PanelProps, "children">;
}

export const MenuList = React.forwardRef<HTMLUListElement, MenuListProps>(
  ({ children, ...props }, ref) => {
    return (
      <MenuListContent {...props} ref={ref}>
        {React.Children.map(
          children,
          (item: any, index) =>
            item &&
            React.cloneElement(item as any, {
              role: isValidItemType(item)
                ? (item.props as any).role ?? "menuitem"
                : (item.props as any).role,
            }),
        )}
      </MenuListContent>
    );
  },
);

const MenuListContent = React.forwardRef<HTMLUListElement, MenuListProps>(
  (
    {
      children,
      className,
      panelClassName,
      nav: xnav = false,
      hover = true,
      active = true,
      focus = true,
      panelProps,
      itemStyle = {
        disabled: "",
        className:
          "px-3 py-2 rounded-0 hover:bg-header-min active:bg-slate-200 dark:active:bg-slate-700 focus:bg-slate-200 dark:focus:bg-slate-700",
      },
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { menu, panel } = useTailwindTheme();
    const {
      styles: { base },
    } = menu;

    const {
      open,
      handler,
      strategy,
      x,
      y,
      floating,

      listItemsRef,
      getFloatingProps,
      getItemProps,
      appliedAnimation,
      lockScroll,
      context,
      activeIndex,
      tree,
      allowHover,
      internalAllowHover,
      setActiveIndex,
      nested,
      arrow,
      arrowRef,
      disablePortal,
      nav,
    } = useMenu();

    const arrowXx = context.middlewareData.arrow?.x ?? 0;
    const arrowYy = context.middlewareData.arrow?.y ?? 0;
    const arrowW = arrow?.props?.width ?? 0;
    const arrowH = arrow?.props?.height ?? 0;
    const transformX = arrowXx + arrowW / 2;
    const transformY = arrowYy + arrowH;

    function cbTransform(other: any) {
      return `${other}translate(${x}px, ${y}px)`;
    }
    //m(Panel);
    const [initialized, setInitialized] = React.useState(false);
    const [openState, setOpenStated] = React.useState(false);
    const timeoutRef = useRef(0);
    const wasOpenState = useRef(false);

    // 4. set refs
    const mergedRef = useRefs(ref, floating);
    React.useEffect(() => {
      if (open && !initialized) {
        setInitialized(true);
      }
    }, [open, initialized]);

    React.useEffect(() => {
      if (open && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = 0;
      }
    }, [open, timeoutRef]);

    React.useEffect(() => {
      if (open && !openState && initialized) {
        setOpenStated(true);
      }
      if (!open && openState) {
        //@ts-ignore
        timeoutRef.current = setTimeout(() => setOpenStated(open), 400);
      }
    }, [open, openState, initialized]);

    React.useEffect(() => {
      if (openState && !wasOpenState.current) {
        wasOpenState.current = true;
      }
    }, [openState]);

    const [side] = context.placement.split("-") as [Side];

    const transformOrigin = useMemo(() => {
      return (open && initialized) || openState
        ? {
            top: `${transformX}px${arrowH ? ` calc(100% + ${arrowH}px)` : " 100%"}`,
            bottom: `${transformX}px${arrowH ? ` ${-arrowH}px` : " 0px"}`,
            left: `${arrowH ? `calc(100% + ${arrowH}px) ` : "100% "}${transformY}px`,
            right: `${arrowH ? `${-arrowH}px ` : "0px "}${transformY}px`,
          }[side]
        : undefined;
    }, [side, transformX, transformY, arrowH, initialized, open, openState]);

    if (!initialized && !nested) {
      //console.log("!initialized");
      return null;
    }

    if (nested) {
      //console.log("transformOrigin:", animation.current?.amount?.transformOrigin)
    }

    // 2. set default props
    className = className ?? menu.defaultProps.className;

    // 3. set styles
    const panelClasses = twMerge(
      classnames(objectsToString(base.panel)),
      panelClassName,
    );
    const menuClasses = twMerge(
      classnames(objectsToString(base.menu)),
      className,
    );

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
                  ...getItemProps({
                    ref(node: HTMLButtonElement) {
                      listItemsRef.current[index] = node;
                    },
                  }),
                } as any)
              : React.cloneElement(child, {
                  //@ts-ignore
                  "area-active": activeIndex === index ? "true" : undefined,
                  ...getItemProps({
                    tabIndex: activeIndex === index ? 0 : -1,
                    role: "menuitem",
                    className: (child.props as any).className,
                    ref(node: HTMLButtonElement) {
                      listItemsRef.current[index] = node;
                    },
                    onClick(event) {
                      if ((child.props as any).onClick) {
                        (child.props as any).onClick?.(event);
                      }
                      tree?.events.emit("click");
                    },
                    onMouseEnter() {
                      if (
                        (allowHover && open) ||
                        (internalAllowHover && open)
                      ) {
                        setActiveIndex(index);
                      }
                    },
                  }),
                })),
        );

    const child = !nav ? (
      <MenuListRoot
        itemStyle={itemStyle}
        className={menuClasses}
        role="menu"
        {...rest}
      >
        {items}
      </MenuListRoot>
    ) : (
      <FloatingFocusManager
        context={context}
        modal={!nested}
        initialFocus={nested ? -1 : 0}
        returnFocus={!nested}
        visuallyHiddenDismiss
      >
        <MenuListRoot
          hover={hover}
          active={active}
          focus={focus}
          itemStyle={itemStyle}
          className={menuClasses}
          role="menu"
          {...rest}
        >
          {items}
        </MenuListRoot>
      </FloatingFocusManager>
    );

    const { floatingStyles } = context;
    // 6. menu component.
    const menuComponent = (
      <div
        className="z-modal left-0 top-0"
        key={`move-${context.nodeId}`}
        ref={mergedRef as any}
        {...getFloatingProps({
          onKeyDown(event) {
            if (event.key === "Tab" && !nav) {
              handler?.(false);

              if (event.shiftKey) {
                event.preventDefault();
              }
            }
          },
          style: {
            position: strategy,
            ...floatingStyles,
            transition: wasOpenState.current
              ? "transform 240ms cubic-bezier(0.4, 0, 0.2, 1)"
              : undefined,
          },
        })}
      >
        <div
          style={{
            transformOrigin,
            opacity: openState && open ? 1 : 0,
            transform: openState && open ? "scale(1)" : "scale(0)",
            transition:
              "opacity 361ms cubic-bezier(0.4, 0, 0.2, 1), transform 240ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onTransitionEnd={() => {
            //console.log("onTransitionEnd:");
            //@ts-ignore
            !open &&
              (timeoutRef.current = setTimeout(() => setOpenStated(open), 400));
            open && setOpenStated(open);
          }}
        >
          <PanelRoot
            className={panelClasses}
            elevation={4}
            variant="outlined"
            {...panelProps}
          >
            {child}
          </PanelRoot>

          <FloatingArrow
            {...arrow?.props}
            className={clsx(
              arrow?.props?.className,
              (nested || !arrow) && "hidden",
            )}
            ref={arrowRef as any}
            context={context}
          />
        </div>
      </div>
    );
    ///console.log("openState:", openState, ", open:", open);
    let finalChild = lockScroll ? (
      <FloatingOverlay lockScroll>{menuComponent}</FloatingOverlay>
    ) : (
      menuComponent
    );
    if (!disablePortal) {
      finalChild = (
        <FloatingPortal id="mux-portal">{finalChild}</FloatingPortal>
      );
    }
    // 7. return
    return (openState || open) && finalChild;
  },
);

/**
 * `transform` is order-dependent, so if you scale(0.5) before translateX(100px),
 * the visual translate will only be 50px.
 *
 * The intuitive pattern is to translate before doing things like scale and
 * rotate that will affect the coordinate space. So Framer Motion takes an
 * opinion on that and allows you to animate them
 * individually without having to write a whole transform string.
 *
 * However in this component we're doing something novel by inverting
 * the scale of the parent component. Because of this we want to translate
 * through scaled coordinate space, and can use the transformTemplate prop to do so.
 */
const scaleTranslate = (props: any) => {
  const { x, y, scaleX, scaleY } = props;
  //console.log("scaleTranslate:", props);
  return `scale(${scaleX}, ${scaleY}) translate3d(${x}, ${y}, 0)`;
};

MenuList.displayName = "Mux.MenuList";

export default MenuList;
