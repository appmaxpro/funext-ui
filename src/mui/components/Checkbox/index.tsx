import React, { ChangeEventHandler, ForwardedRef, useCallback, useRef } from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";
import { useRipple } from "../../ripple";

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
import { styled } from "../../styles";
import { useControlled, useForwardedRef, useThemeColor } from "../../hooks";

export const CheckboxRoot = styled('div', {
  name: 'MuxCheckbox',
  slot: 'Root',
  overridesResolver: (props:any, styles:any) => styles.root,  
})( {
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing:' 0.02857em',
  textTransform: 'uppercase',
  minWidth: '64px',
  borderRadius: '4px',
  backgroundColor: 'unset',
  transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,' +
     'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,' +
     'border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,' +
     'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  ['&:active, &:focus'] : {
    outline: 0
  },
  ['&:disabled']: {
    pointerEvents: 'none',
    opacity: .6,
    boxShadow: 'none',
  },
  variants: [
    {
      props: {
        variant: 'text'
      },
      style: {
         
      },
      classes: 'text-ccccc'
    },
    {
      props: {
        variant: 'filled',
        hasColor: true
      },
      style: {
         backgroundColor: 'var(--bt-color)',
         color: 'var(--bt-text-color)',
         ['&:hover']: {
           backgroundColor: 'rgb(var(--bt-color-dark) / 50%)',
         },
         ['&:focus']: {
          backgroundColor: 'rgb(var(--bt-color-dark) / 70%) '
        },
        ['&:active']: {
          backgroundColor: 'rgb(var(--bt-color-dark) / 65%) ',
        }
      },
    },
    {
      props: {
        size: 'sm'
      },
      style: {
        fontSize: '0.8125rem',
        padding: '4px 5px',
      }
    },
    {
      props: {
        size: 'md'
      },
      style: {
        fontSize: '0.875rem',
        padding: '6px 16px',
      }
    },
    {
      props: {
        size: 'lg'
      },
      style: {
        fontSize: '0.9375rem',
        padding: '8px 22px',
        gap: 3
      }
    },
  ]

});

export interface CheckboxProps extends React.ComponentProps<"input"> {
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
  rippleClass?: string;
  error?: boolean;
  indeterminate?: boolean;
  fullWidth?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
      rippleClass,
      error,
      defaultChecked=false,
      checked:isChecked,
      onChange,
      fullWidth,
      indeterminate,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { checkbox } = useTailwindTheme();
    const { defaultProps, valid, styles } = checkbox;
    const { base, colors } = styles;
    const checkboxId = React.useId();

    // 2. set default props
    color = useThemeColor(error ? 'error' : color, defaultProps.color);
    icon = icon ?? defaultProps.icon;
    ripple = ripple ?? defaultProps.ripple;
    disabled = disabled ?? defaultProps.disabled;
    containerProps = containerProps ?? defaultProps.containerProps;
    labelProps = labelProps ?? defaultProps.labelProps;
    iconProps = iconProps ?? defaultProps.iconProps;
    className = twMerge(defaultProps.className || "", className);

    const labelRef = useRef<HTMLElement>();
    const colorClass = colors[findMatch(valid.colors, color, "primary")]
    const matchColor = objectsToString(colorClass)
    // 3. set ripple effect instance
    const {ref: rippleRef, className: rippleClassName} = useRipple<HTMLElement>({
      ref:labelRef as ForwardedRef<HTMLElement>,
      disabled: disabled || ripple === false,
      className: (rippleClass ?? `bg-${color ?? "primary"}-500`) ,
    });

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
    
    // 4. set styles
    const rootClasses = classnames(objectsToString(base.root), {
      [objectsToString(base.disabled)]: disabled,
      ["w-full"]: fullWidth
    });
    const containerClasses = twMerge(
      classnames(
        objectsToString({
          ...base.container, 
          color: ((checked || indeterminate) 
                ? `text-${color ?? "primary"}-500`
                : undefined
          ),
        }), 
        {
          [rippleClassName]: !disabled && ripple !== false,
        },
      ),
      containerProps?.className,
    );

    const inputClasses = twMerge(
      classnames(
        objectsToString(base.input),
      ),
      'MuxCheckbox-root',
      className,
    );
    const labelClasses = twMerge(
        classnames(objectsToString(base.label), fullWidth && 'grow'),
        labelProps?.className
    );

    const iconContainerClasses = twMerge(
      classnames(objectsToString(base.icon)),
      iconProps?.className,
    );

    //const inputRef = useForwardedRef(ref);

    return (
      <div ref={rootRef} className={rootClasses}>
        <div
          {...containerProps}
          className={containerClasses}
          ref={rippleRef as any}
        >
          <input
            {...rest}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={inputClasses}
            checked={isChecked}
            //@ts-ignore 
            indeterminate={indeterminate ? true: undefined}
            onChange={handleValueChange}
            id={rest.id || checkboxId}
          />
          {icon || (
              
              <svg className={iconContainerClasses} focusable="false" 
                  aria-hidden="true" viewBox="0 0 24 24" 
                  data-testid="CheckBoxIcon">
                    {checked 
                        ? <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                        : indeterminate
                        ? <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"></path>
                        : <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                      }
                    </svg>
              
            )}
        </div>
        {label && (
          <label {...labelProps} className={labelClasses} htmlFor={rest.id || checkboxId}>
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Mux.Checkbox";

export default Checkbox;
