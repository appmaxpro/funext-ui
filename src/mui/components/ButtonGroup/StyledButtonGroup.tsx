import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  variant,
  size,
  color,
  fullWidth,
  ripple,
  className,
  children,
} from "../../types/components/button";
import { useThemeColor } from "../../hooks";

export interface StyledButtonGroupProps extends React.ComponentProps<"div"> {
  variant?: variant;
  size?: size;
  color?: color;
  fullWidth?: fullWidth;
  ripple?: ripple;
  className?: className;
  children: children;
  shadow?:boolean;
}

export const StyledButtonGroup = React.forwardRef<HTMLDivElement, StyledButtonGroupProps>(
  ({ variant, size, color, fullWidth, ripple, className, shadow=true, children, ...rest }, ref) => {
    // 1. init
    const { buttonGroup } = useTailwindTheme();
    const { defaultProps, styles, valid } = buttonGroup;
    const { base, dividerColor } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = useThemeColor(color, defaultProps.color);
    ripple = ripple ?? defaultProps.ripple;
    fullWidth = fullWidth ?? defaultProps.fullWidth;
    className = twMerge(defaultProps.className || "", className);

    // 4. set styles
    const classes = twMerge(
      classnames(objectsToString(base.initial), {
        [objectsToString(base.fullWidth)]: fullWidth,
        "divide-x": variant !== "outlined",
        [objectsToString(dividerColor[findMatch(valid.colors, color, "primary")])]:
          variant !== "outlined",
        ['fill-button-shadow']: shadow && (variant === 'filled' || variant === 'ghost')
      }),
      className,
    );

    // 5. return
    return (
      <div {...rest} ref={ref} className={classes}>
        {React.Children.map(
          children,
          (child, index) =>
            React.isValidElement(child) &&
            React.cloneElement(child, {
              shadow: false,
              variant,
              size,
              color,
              ripple,
              fullWidth,
              className: twMerge(
                classnames({
                  "ltr:rounded-r-none rtl:rounded-l-none": index !== React.Children.count(children) - 1,
                  "ltr:border-r-0 rtl:border-l-0": index !== React.Children.count(children) - 1,
                  "ltr:rounded-l-none rtl:rounded-r-none": index !== 0,
                  
                }, "outline-0 active:outline-0 shadow-0"),
                child.props?.className,
              ),
            } as any),
        )}
      </div>
    );
  },
);

StyledButtonGroup.displayName = "Mux.StyledButtonGroup";

export default StyledButtonGroup;
