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
  FloatingArrow,
} from "@floating-ui/react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { useMenu } from "./MenuContext";
import { isMenuItemValid, isValidItemType, pickAnimation } from "./utils";

// types
import {
  clsx,
  styled,
  StyledComponent,
  useRtl,
  keyframes,
  css,
} from "../../styles";
import Panel, { PanelProps } from "../Panel";
import List, { ListProps } from "../List";
import { useRefs } from "../../hooks";
import { Box } from "../Box";
import { Presence } from "../../lib/presence";
import { Portal } from "../../lib/portal";
import { scaleFadeStyle } from "../internal/animation";

const PanelRoot = styled(Panel, {
  name: "MuxMenu",
  slot: "panel",
  overridesResolver: (props, styles) => styles.root,
})(
  ({ theme }) => ({
    ...theme.typography.body1,
    boxShadow:
      "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
    willChange: "transform, opacity",
    minWidth: 200,
    borderRadius: 6,
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
                ? ((item.props as any).role ?? "menuitem")
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
      floating,
      listItemsRef,
      getFloatingProps,
      getItemProps,
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
      animate
    } = useMenu();

    const middlewareData = context.middlewareData;

    //m(Panel);
    const [initialized, setInitialized] = React.useState(false);

    // 4. set refs
    const mergedRef = useRefs(ref, floating);
    React.useEffect(() => {
      if (open && !initialized) {
        setInitialized(true);
      }
    }, [open, initialized]);

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
        data-state={open ? "open" : "close"}
        data-ui="MenuListRoot"
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
          className={panelClasses}
          elevation={4}
          variant="outlined"
          data-state={open ? "open" : "close"}
          data-ui="MenuListPanel"
          {...panelProps}
        >
          {child}
          {middlewareData.arrow && (
            <Arrow
              {...arrow?.props}
              className={clsx(
                arrow?.props?.className,
                (nested || !arrow) && "hidden",
              )}
              ref={arrowRef as any}
              context={context}
              data-state={open ? "open" : "close"}
              data-ui="MenuArrow"
            />
          )}
        </PanelRoot>
      </div>
    );
    ///console.log("openState:", openState, ", open:", open);
    let finalChild = lockScroll ? (
      <FloatingOverlay lockScroll>{menuComponent}</FloatingOverlay>
    ) : (
      menuComponent
    );
    if (!disablePortal) {
      finalChild = <Portal>{finalChild}</Portal>;
    }

    return <Presence present={open}>{finalChild}</Presence>;
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
