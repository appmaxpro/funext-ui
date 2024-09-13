import React, { ForwardedRef, useCallback, useRef } from "react";

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
  icon,
  ripple,
  className,
  disabled,
  objectType,
} from "../../types/components/checkbox";
import { useControlled, useThemeColor } from "../../hooks";


export interface RadioProps extends React.ComponentProps<"input"> {
  color?: color;
  label?: label;
  icon?: icon;
  ripple?: ripple;
  className?: className;
  disabled?: disabled;
  containerProps?: objectType;
  labelProps?: objectType;
  iconProps?: objectType;
  rootRef?: React.Ref<HTMLDivElement>;
  rippleClass?:string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      color,
      label,
      icon,
      ripple,
      className,
      disabled,
      containerProps,
      labelProps,
      iconProps,
      rootRef,
      checked:isChecked,
      defaultChecked,
      onChange,
      rippleClass,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { radio } = useTailwindTheme();
    const { defaultProps, valid, styles } = radio;
    const { base, colors } = styles;
    const radioId = React.useId();

    const [checked, setChecked] = useControlled({
      name: 'input',
      prop: 'checked',
      state: isChecked,
      defaultState: defaultChecked
   })

   const handleValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
     setChecked((event.currentTarget || event.target)?.checked);
     onChange?.(event);
   }, [onChange, setChecked]) 

    // 2. set default props
    color = useThemeColor(color, defaultProps.color);
    label = label ?? defaultProps.label;
    icon = icon ?? defaultProps.icon;
    ripple = ripple ?? defaultProps.ripple;
    disabled = disabled ?? defaultProps.disabled;
    containerProps = containerProps ?? defaultProps.containerProps;
    labelProps = labelProps ?? defaultProps.labelProps;
    iconProps = iconProps ?? defaultProps.iconProps;
    className = twMerge(defaultProps.className || "", className);

    const labelRef = useRef<HTMLLabelElement>();
    const colorClass = colors[findMatch(valid.colors, color, "primary")]
    
    // 3. set ripple effect instance ForwardedRef
    const {ref: rippleRef, className: rippleClassName} = useRipple({
      ref: labelRef as ForwardedRef<HTMLLabelElement>,
      disabled: disabled || ripple === false,
      className: rippleClass ?? colorClass?.color?.replace("text-", "bg-")
    });

    // 4. set styles
    const rootClasses = classnames(objectsToString(base.root), {
      [objectsToString(base.disabled)]: disabled,
    });
    const containerClasses = twMerge(
      classnames(objectsToString(base.container), rippleClassName),
      containerProps?.className,
    );
    const inputClasses = twMerge(
      classnames(
        objectsToString(base.input),
        checked && objectsToString(colorClass),
      ),
      className,
    );
    const labelClasses = twMerge(classnames(objectsToString(base.label)), labelProps?.className);
    const radioIconClasses = classnames(
      classnames(objectsToString(base.icon)),
      colorClass?.color,
      iconProps?.className,
    );

    return (
      <div ref={rootRef} className={rootClasses}>
        <label
          {...containerProps}
          className={containerClasses}
          htmlFor={rest.id || radioId}
          ref={rippleRef}
          >
          <input
            {...rest}
            ref={ref}
            type="radio"
            disabled={disabled}
            className={inputClasses}
            checked={checked}
            onChange={handleValueChange}
            id={rest.id || radioId}
          />
          <span className={radioIconClasses}>
            {icon || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <circle data-name="ellipse" cx="6" cy="6" r="6" />
              </svg>
            )}
          </span>
        </label>
        {label && (
          <label {...labelProps} className={labelClasses} htmlFor={rest.id || radioId}>
            {label}
          </label>
        )}
      </div>
    );
  },
);


Radio.displayName = "Mux.Radio";

export default Radio;
