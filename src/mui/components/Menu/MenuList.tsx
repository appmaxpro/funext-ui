'use client';
import React, { useEffect, useMemo, useRef } from "react";

// @floating-ui
import {
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useMergeRefs,
  FloatingArrow,
  Side
} from "@floating-ui/react";

// framer-motion
import { 
  AnimatePresence, 
  motion, 
  m, 
  LazyMotion, 
  domAnimation,
  createDomMotionComponent,
  cubicBezier
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

import { clsx, styled, StyledComponent } from "../../styles";
import Panel from "../Panel";
import List, { ListProps } from "../List";

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
});

export interface MenuListProps extends ListProps {
  dismissible?: boolean;
  panelClassName?: string;
  nav?: boolean;
  children?: React.ReactNode
}


export const MenuList = React.forwardRef<HTMLUListElement, MenuListProps>(
  ({children, ...props}, ref) => {
   
   return <MenuListContent {...props}>
    {React.Children.map(children,  (item:any, index) => 
        item &&
        React.cloneElement(item as any, {
          'role': isValidItemType(item) ? (item.props as any).role ?? 'menuitem' : (item.props as any).role            
          })
        )
      }
 </MenuListContent>
})



const MenuListContent = React.forwardRef<HTMLUListElement, MenuListProps>(
  (
    {
      children,
      className,
      panelClassName,
      nav = false,
      hover = true,
      active = true,
      focus = true,
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


    const placement = context.placement;
    const usageContext = context.middlewareData.arrow 
          ? context.middlewareData.arrow 
          : context;
    
    const side = placement.split('-')[0] as Side;

    const animation = React.useRef({});

    const shouldOpen = initialized || nested;

    useEffect(()=> {

      if (!open && !openState) {
        //animation.current = {};
        return;
      };
      
      const transformOrigin = {
        top: `${
          usageContext?.x ?? 0
        }px bottom`,
        bottom: `${
          usageContext?.x ?? 0
        }px top`,
        left: `right ${
          usageContext?.y ?? 0
        }px bottom`,
        right: `left ${
          usageContext?.y ?? 0
        }px`,
      }[side];

      const {amount, unmount, ...others} = appliedAnimation as any;

      animation.current = {
        ...others,
        amount: {
          transformOrigin,
          ...amount,
        },
        unmount: {
          transformOrigin,
          ...unmount,
        }
      }
    }, [side, open]);
    
    if ((!initialized && !nested) || !(animation.current as any).amount) {
      return null;
    }

    //console.log("animation:", animation)

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

    const items = React.Children.map(
      children,
      (child:any, index) =>
        React.isValidElement(child) &&
        (!isMenuItemValid(child) 
          ? React.cloneElement(child, 
              {
                'aria-disabled': "true",
                className: clsx(child.props.className, 'item-disabled'),
                ...getItemProps({
                  ref(node: HTMLButtonElement) {
                    listItemsRef.current[index] = node;
                  },
                }),
                
              }
          )
          : React.cloneElement(child, {
            "area-active": activeIndex === index ? "true" : undefined,
            ...getItemProps({
              tabIndex: activeIndex === index ? 0 : -1,
              role: "menuitem",
              className: child.props.className,
              ref(node: HTMLButtonElement) {
                listItemsRef.current[index] = node;
              },
              onClick(event) {
                if (child.props.onClick) {
                  child.props.onClick?.(event);
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

    const child = nav ? (
      <FocusTrap>
        <ArrowNavigation selector="auto-vertical">
          <MenuListRoot
            itemStyle={itemStyle}
            className={menuClasses}
            role="menu"
            //tabIndex={0}
            //ref={listRef}
            {...rest}
          >
            {items}
          </MenuListRoot>
        </ArrowNavigation>
      </FocusTrap>
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
      <motion.div
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
        onAnimationComplete={(def)=> {
          console.log("onAnimationComplete:", def);
          setOpenStated(open);
        }}
        transformTemplate={scaleTranslate}
      >
        <PanelRoot className={panelClasses} elevation={4} variant="outlined">{child}</PanelRoot>
        <FloatingArrow
            {...arrow?.props}
            className={clsx(arrow?.props?.className, (nested || !arrow) && 'hidden')}
            ref={arrowRef as any}
            context={context}
          />
      </motion.div>
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
          <FloatingPortal id="menu-portal">
            <NewAnimatePresence>
              {(open || openState) && (
                <>
                  {lockScroll ? (
                    <FloatingOverlay lockScroll>
                      {menuComponent}
                    </FloatingOverlay>
                  ) : (
                    menuComponent
                  )}
                </>
              )}
            </NewAnimatePresence>
          </FloatingPortal>
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
const scaleTranslate = ({ x, y, scaleX, scaleY }:any) =>
  `scaleX(${scaleX}) scaleY(${scaleY}) translate(${x}, ${y}) translateZ(0)`;


MenuList.displayName = "Mux.MenuList";

export default MenuList;
