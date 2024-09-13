import React, { useMemo } from "react";

// framer-motion
import { AnimatePresence, m, useAnimation, domAnimation, LazyMotion } from "framer-motion";

// @floating-ui
import { 
  useFloating, 
  useInteractions, 
  useDismiss ,
  type Strategy
} from "@floating-ui/react";

// utils
import merge from "deepmerge";
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import {
  open,
  size,
  overlay,
  children,
  placement,
  overlayProps,
  className,
  onClose,
  dismiss,
  transition,
  overlayRef
} from "../../types/components/drawer";
import useEnhancedEffect from "@mui/utils/useEnhancedEffect";
import { isRTL } from "../../../core";
import { SxComponentProps } from "../../styles";

export interface DrawerProps extends SxComponentProps<"div"> {
  open: boolean;
  size?: size;
  overlay?: boolean;
  children: children;
  placement?: placement;
  overlayProps?: overlayProps;
  className?: className;
  onClose?: onClose;
  dismiss?: dismiss;
  transition?: transition;
  overlayRef?: overlayRef;
  strategy?:Strategy;
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      size,
      overlay,
      children,
      placement,
      overlayProps,
      className,
      onClose,
      dismiss,
      transition,
      overlayRef,
      strategy,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { drawer } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = drawer;
    const controls = useAnimation();

    // 2. set default props
    size = size ?? defaultProps.size;
    overlay = overlay ?? defaultProps.overlay;
    placement = placement ?? defaultProps.placement;
    overlayProps = overlayProps ?? defaultProps.overlayProps;
    onClose = onClose ?? defaultProps.onClose;
    dismiss = merge(defaultProps.dismiss, dismiss || {}) ?? defaultProps.dismiss;
    transition = transition ?? defaultProps.transition;
    className = twMerge(defaultProps.className || "", className);

    
    // 3. set the drawer
    const { context, refs, strategy:floatStrategy } = useFloating({
      open,
      onOpenChange: onClose,
      strategy
    });

    const { getFloatingProps } = useInteractions([useDismiss(context, dismiss)]);

    React.useEffect(() => {
      controls.start(open ? "open" : "close");
    }, [open, controls, placement]);

    //@ts-nocheck
    const isRtl = useMemo(()=> isRTL((refs.reference?.current ?? refs.floating?.current) as any), []);
    
    const dirPlacement = ((placement === "left" || placement === "right") && isRtl) 
         ? (placement === "left" ? 'right' : 'left')
         : placement;

    const drawerAnimation = {
      open: {
        x: 0,
        y: 0,
      },
      close: {
        x: dirPlacement === "left" ? -size! : dirPlacement === "right" ? size : 0,
        y: placement === "top" ? -size! : placement === "bottom" ? size : 0,
      },
    };

    const backdropAnimation = {
      unmount: {
        opacity: 0,
        transition: {
          delay: 0.3,
        },
      },
      mount: {
        opacity: 1,
      },
    };

    // 4. set styles
    const drawerClasses = twMerge(
      classnames(objectsToString(base.drawer), {
        "top-0 end-0": placement === "right",
        "bottom-0 left-0": placement === "bottom",
        "top-0 start-0": placement === "top" || placement === "left",
      }),
      'z-modal',
      className,
    );
    const overlayClasses = twMerge(
      classnames(objectsToString(base.overlay)),
      'z-modal',
      overlayProps?.className,
    );

    // 5. return
    return (
      <React.Fragment>
        <LazyMotion features={domAnimation}>
          <AnimatePresence>
            {overlay && open && (
              <m.div
                ref={overlayRef}
                className={overlayClasses}
                initial="unmount"
                exit="unmount"
                animate={open ? "mount" : "unmount"}
                variants={backdropAnimation}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            <m.div
              {...getFloatingProps({
                ref,
                ...rest,
              })}
              className={drawerClasses}
              style={{
                maxWidth: placement === "left" || placement === "right" ? size : "100%",
                maxHeight: placement === "top" || placement === "bottom" ? size : "100%",
                height: placement === "left" || placement === "right" ? "100vh" : "100%",
                position: floatStrategy
              }}
              initial="close"
              animate={controls}
              variants={drawerAnimation}
              transition={transition}
            >
              {children}
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </React.Fragment>
    );
  },
);


Drawer.displayName = "Mux.Drawer";

export default Drawer;
