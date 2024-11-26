"use client";
import React, { useEffect, useMemo, useRef } from "react";

// @floating-ui
import {
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useMergeRefs,
  Side,
} from "@floating-ui/react";

// framer-motion
import {
  AnimatePresence,
  m,
  LazyMotion,
  domAnimation,
  createDomMotionComponent,
  cubicBezier,
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
      nav:xnav = false,
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
      nav
    } = useMenu();

    //m(Panel);
    const [initialized, setInitialized] = React.useState(false);
    const [openState, setOpenStated] = React.useState(open);

    // 4. set refs
    const mergedRef = useMergeRefs([ref, floating]);
    const listRef = useRef();

    React.useEffect(() => {
      if (open && !initialized) {
        setInitialized(true);
      }
    }, [open]);

    const { side, xAxis, yAxis, ...axis } = getArrowOrigin(
      context,
      null,
      useRtl(),
    );

    const arrowX = axis[xAxis];
    const arrowY = axis[yAxis];

    const animation = React.useRef({});

    const shouldOpen = initialized || nested;

    useEffect(() => {
      if (!open && !openState) {
        //animation.current = {};
        return;
      }

      let x = xAxis === "right" ? `right ${arrowX}px` : `${arrowX}px`;
      let y = yAxis === "bottom" ? `bottom ${arrowY}px` : `${arrowY}px`;

      const transformOrigin = {
        top: `${x} bottom`,
        bottom: `${x} top`,
        left: `right ${y}`,
        right: `left ${y}`,
      }[side];

      const { amount, unmount, ...others } = appliedAnimation as any;

      animation.current = {
        ...others,
        amount: {
          transformOrigin,
          ...amount,
        },
        unmount: {
          transformOrigin,
          ...unmount,
        },
      };
    }, [side, open, xAxis, yAxis, arrowX, arrowY]);

    if ((!initialized && !nested) || !(animation.current as any).amount) {
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

    // 5. create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> =
      AnimatePresence;

    const items = !nav
    ? children
    : React.Children.map(
      children,
      (child: any, index) =>
        React.isValidElement(child) &&
        (!isMenuItemValid(child)
          ? React.cloneElement(child, {
              "aria-disabled": "true",
              className: clsx((child.props as any).className, "item-disabled"),
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
                  if ((allowHover && open) || (internalAllowHover && open)) {
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

    //if(nested)
    //console.log("MenuList:nested:", nested, ", cords:", {x, y, open, placement: context.placement})
    // 6. menu component.
    const menuComponent = (
      <m.div
        className="z-modal"
        key={`move-${context.nodeId}`}
        ref={mergedRef as any}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        {...getFloatingProps({
          onKeyDown(event) {
            if (event.key === "Tab" && !nav) {
              handler?.(false);

              if (event.shiftKey) {
                event.preventDefault();
              }
            }
          },
        })}
        initial="unmount"
        exit="unmount"
        animate={open ? "mount" : "unmount"}
        variants={animation.current}
        onAnimationComplete={(def) => {
          //console.log("onAnimationComplete:", def);
          setOpenStated(open);
        }}
        transformTemplate={scaleTranslate}
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
      </m.div>
    );

    // 7. return
    return (
      <LazyMotion features={domAnimation}>
        {disablePortal ? (
          <NewAnimatePresence>
            {(open || openState) && (
              <>
                {lockScroll ? (
                  <FloatingOverlay lockScroll>{menuComponent}</FloatingOverlay>
                ) : (
                  menuComponent
                )}
              </>
            )}
          </NewAnimatePresence>
        ) : (
          <NewAnimatePresence>
            {(open || openState) && (
              <FloatingPortal id="mux-portal">
                <>
                  {lockScroll ? (
                    <FloatingOverlay lockScroll>
                      {menuComponent}
                    </FloatingOverlay>
                  ) : (
                    menuComponent
                  )}
                </>
              </FloatingPortal>
            )}
          </NewAnimatePresence>
        )}
      </LazyMotion>
    );
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
const scaleTranslate = ({ x, y, scaleX, scaleY }: any) =>
  `scaleX(${scaleX}) scaleY(${scaleY}) translate(${x}, ${y}) translateZ(0)`;

MenuList.displayName = "Mux.MenuList";

export default MenuList;
