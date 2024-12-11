import React, {useRef, ForwardedRef} from "react";

// utils
import { useRipple } from "../../ripple";
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  color,
  label,
  ripple,
  className,
  disabled,
  objectType,
} from "../../types/components/checkbox";
import { mapThemeColor } from "../../hooks";

export interface SwitchProps extends React.ComponentProps<"input"> {
  color?: color;
  label?: label;
  ripple?: ripple;
  className?: className;
  disabled?: disabled;
  containerProps?: objectType;
  labelProps?: objectType;
  circleProps?: objectType;
  inputRef?: React.Ref<HTMLInputElement>;
  rippleClass?: string;
  error?: boolean;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      color,
      label,
      ripple,
      className,
      disabled,
      containerProps,
      circleProps,
      labelProps,
      inputRef,
      rippleClass,
      error,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { switch: toggle } = useTailwindTheme();
    const { defaultProps, valid, styles } = toggle;
    const { base, colors } = styles;
    const switchId = React.useId();

    // 2. set default props
    color = mapThemeColor(error ? 'error' : color, defaultProps.color);
    ripple = ripple ?? defaultProps.ripple;
    disabled = disabled ?? defaultProps.disabled;
    containerProps = containerProps ?? defaultProps.containerProps;
    labelProps = labelProps ?? defaultProps.labelProps;
    circleProps = circleProps ?? defaultProps.circleProps;
    className = twMerge(defaultProps.className || "", className);

    
    
    const matchColor = colors[findMatch(valid.colors, color, "primary")];

    // 4. set styles
    const rootClasses = classnames(objectsToString(base.root), {
      [objectsToString(base.disabled)]: disabled,
    });
    const containerClasses = twMerge(
      classnames(objectsToString(base.container)),
      containerProps?.className,
    );
    const inputClasses = twMerge(
      classnames(
        objectsToString(base.input),
        objectsToString(matchColor),
      ),
      className,
    );
    const circleClasses = twMerge(
      classnames(
        objectsToString(base.circle),
        matchColor.circle,
        matchColor.before,
      ),
      circleProps?.className,
    );
    
    const labelClasses = twMerge(classnames(objectsToString(base.label)), labelProps?.className);

    // 3. set ripple effect instance ForwardedRef
    // 3. set ripple effect instance
    const labelRef = useRef<HTMLDivElement>();
    //const circleRef = useRef<HTMLDivElement>();

    const {ref: rippleRef, className: rippleClassName} = useRipple({
      ref: labelRef as ForwardedRef<HTMLDivElement>,
      disabled: disabled || ripple === false,
      className: rippleClass ?? matchColor.input?.replace("checked:", ""),
      overflow: true,
      //trigger: circleRef.current
    });

    // 4. return
    return (
      <div ref={ref} className={rootClasses}>
        <div {...containerProps} className={containerClasses}>
          <input
            {...rest}
            ref={inputRef}
            type="checkbox"
            disabled={disabled}
            id={rest.id || switchId}
            className={inputClasses}
          />
          <label {...circleProps} htmlFor={rest.id || switchId} 
             className={classnames(circleClasses, circleClasses)} ref={rippleRef as any} >
            
          </label>
        </div>
        {label && (
          <label {...labelProps} htmlFor={rest.id || switchId} className={labelClasses}>
            {label}
          </label>
        )}
      </div>
    );
  },
);

Switch.displayName = "Mux.Switch";

export default Switch;
