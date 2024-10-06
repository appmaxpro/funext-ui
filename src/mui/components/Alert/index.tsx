import React, { Fragment } from "react";

// framer-motion
import { AnimatePresence, m, MotionProps, domAnimation, LazyMotion } from "framer-motion";

// utils
import classnames from "classnames";
import merge from "deepmerge";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { styled, SxComponentProps } from "../../styles";
// types
import type { NewAnimatePresenceProps } from "../../types/generic";
import type {
  variant,
  color,
  icon,
  open,
  action,
  animate,
  className,
  children,
  onClose,
} from "../../types/components/alert";

import IconButton from "../IconButton";
import Text from "../Text";
import { useThemeColor } from "../../hooks";


const AlertRoot = styled(m.div, {
  name: 'MuxAlert',
  slot: 'Root',
})('');

const AlertDivRoot = styled(m.div, {
  name: 'MuxAlert',
  slot: 'Root',
})('');

export interface AlertProps extends SxComponentProps<"div"> {
  variant?: variant;
  color?: color;
  icon?: icon;
  open?: open;
  onClose?: onClose;
  action?: action;
  animate?: animate;
  title?: children;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, color, icon, title, open, action, onClose, animate, className, children, ...rest }, ref) => {
    // 1. init
    const { alert } = useTailwindTheme();
    const { defaultProps, valid, styles } = alert;
    const { base, variants } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    color = useThemeColor(color, defaultProps.color);
    if (animate === true)
        animate =animate === true ?  defaultProps.animate : animate ?? defaultProps.animate;
    open = open ?? defaultProps.open;

    if (!animate && !open) {
      return null;
    }


    action = action ?? defaultProps.action;
    onClose = onClose ?? defaultProps.onClose;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const alertBase = objectsToString(base.alert);
    const alertAction = objectsToString(base.action);

    const alertVariantMap = variants[findMatch(valid.variants, variant, "ghost")][
      findMatch(valid.colors, color, "sky")
    ];

    const rippleColor = alertVariantMap?.color;
    const rippleColorClass = rippleColor && rippleColor.startsWith('text-') 
        ? rippleColor.replace('text-', 'bg-')
        : null;

    const alertVariant = objectsToString(alertVariantMap);
    const classes = twMerge(classnames(alertBase, alertVariant), className);
    const actionClasses = classnames(alertAction);

     // // 4. icon template
    const iconTemplate = <div className="shrink-0">{icon}</div>;

    //let Comp = animate ? Fragment : 
    
    const child = open && (
      <>
        {icon && iconTemplate}
        <div className={`${icon ? "ms-3" : ""} me-12${title ? " flex flex-col" : ""}`}>
           {typeof title === 'string' ? <Text variant="h4">{title}</Text> : title}
           {children}
        </div>
        {onClose && !action && (
          <IconButton
            onClick={onClose}
            size="sm"
            color={variant === "outlined" || variant === "ghost" ? color : "transparent"}
            rippleClassName={rippleColorClass}
            className={actionClasses}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        )}
        {action || null}
      </>
    );

    if (!animate){
      return (<AlertDivRoot
        {...rest}
        ref={ref}
        role="alert"
        className={classes}>
        {child}
      </AlertDivRoot>);
    }


    // 5. set animation
    const mainAnimation = {
      unmount: {
        opacity: 0,
      },
      mount: {
        opacity: 1,
      },
    };

    const appliedAnimation = merge(mainAnimation, animate as any);

    // 6. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

    // 7. return
    return (
      <LazyMotion features={domAnimation}>
        <NewAnimatePresence>
          {open && (
            <AlertRoot
              {...rest}
              ref={ref}
              role="alert"
              className={classes}
              initial="unmount"
              exit="unmount"
              animate={open ? "mount" : "unmount"}
              variants={appliedAnimation}
            >
              
              {child}
            </AlertRoot>
          )}
        </NewAnimatePresence>
      </LazyMotion>
    );
  },
);

Alert.displayName = "Mux.Alert";

export default Alert;
