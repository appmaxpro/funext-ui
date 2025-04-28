import React, { Fragment } from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { memoTheme, styled, SxComponentProps } from "../../styles";
// types
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
import { mapThemeColor } from "../../hooks";
import Panel from "../Panel";


const AlertDivRoot = styled(Panel, {
  name: "MuxAlert",
  slot: "Root",
})(
  memoTheme(({ theme }) => {
    return {
      ...theme.typography.body2,
      display: "flex",
      flexGrow: 1,
      [theme.breakpoints.up("sm")]: {
        flexGrow: "initial",
        minWidth: 288,
      },
    };
  }),
);

export interface AlertProps extends Omit<SxComponentProps<"div">, "title"> {
  variant?: variant;
  color?: color;
  icon?: React.ReactNode;
  open?: open;
  onClose?: onClose;
  action?: action;
  animate?: animate;
  title?: children;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant,
      color,
      icon,
      title,
      open,
      action,
      onClose,
      animate,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { alert } = useTailwindTheme();
    const { defaultProps, valid, styles } = alert;
    const { base, variants } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    color = mapThemeColor(color, defaultProps.color);
    if (animate === true)
      animate =
        animate === true
          ? defaultProps.animate
          : animate ?? defaultProps.animate;
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

    const alertVariantMap =
      variants[findMatch(valid.variants, variant, "ghost")][
        findMatch(valid.colors, color, "sky")
      ];

    const alertVariant = objectsToString(alertVariantMap);
    const classes = twMerge(classnames(alertBase, alertVariant), className);
    const actionClasses = classnames(alertAction);

    //let Comp = animate ? Fragment :

    const child = open && (
      <AlertDivRoot
        {...(rest as any)}
        ref={ref}
        role="alert"
        className={classes}
      >
        {icon && <div className="shrink">{icon}</div>}
        <div
          className={`flex-1-auto max-w-full overflow-hidden ${icon ? "ms-3" : ""}${title || onClose ? " flex flex-col" : ""}`}
        >
          {(onClose || title) ? (
            <div className="flex justify-between flex-nowrap min-h-6 w-full">
              {typeof title === "string" ? (
                <Text variant="h6">{title}</Text>
              ) : (
                title
              )}
              {onClose && (
                <IconButton
                  onClick={onClose as any}
                  dense
                  color={
                    variant === "outlined" || variant === "ghost"
                      ? color
                      : "transparent"
                  }
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </IconButton>
              )}
            </div>
          ) : null}
          {children}
        </div>

        {action || null}
      </AlertDivRoot>
    );
    return child;
    
  },
);

Alert.displayName = "Mux.Alert";

export default Alert;
