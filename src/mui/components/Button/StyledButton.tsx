import React, { useEffect } from "react";

// utils
//import Ripple from "material-ripple-effects";
import {cn} from "../../utils/cn";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// components
import Spinner from "../Spinner";


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
import { styled } from "../../styles";
import { useThemeColor } from "../../hooks";
import {ButtonBase, ButtonBaseProps} from './ButtonBase';

export const ButtonRoot = styled(ButtonBase, {
  name: 'MuxStyledButton',
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

export interface StyledButtonProps extends ButtonBaseProps {
  variant?: variant;
  size?: size;
  color?: color;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode | string;
  endIcon?: React.ReactNode | string;
  shadow?:boolean;
}

export const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  ({ 
    variant, 
    size, 
    color, 
    fullWidth, 
    ripple, 
    className, 
    children, 
    loading, 
    rippleClassName,
    startIcon,
    endIcon,
    shadow = true,
    focusRipple = true,
     ...rest 
    }, ref) => {
    // 1. init
    const { button } = useTailwindTheme();
    const { valid, defaultProps, styles } = button;
    const { base, variants, sizes, shadow:shadowClass } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = useThemeColor(color, defaultProps.color);
    fullWidth = fullWidth ?? defaultProps.fullWidth;
    ripple = ripple ?? defaultProps.ripple;
    className = twMerge(defaultProps.className || "", className);

    
    // 4. set styles
    const buttonBase = objectsToString(base.initial);
    const variantName = findMatch(valid.variants, variant, "filled")
    const buttonVariantColor = variants[variantName][findMatch(valid.colors, color, "primary")];
    const buttonVariant = objectsToString(buttonVariantColor);

    const sizeName = findMatch(valid.sizes, size, "md");
    const buttonSize = objectsToString(sizes[sizeName]);
    const classes = cn(
        buttonBase,
        buttonSize,
        buttonVariant,
        {
          [objectsToString(base.fullWidth)]: fullWidth,
        },
        {
          [shadowClass]: shadow && variant === 'filled',
        },
      `mt-button mt-variant-${variant} mt-color-${color} mt-size-${sizeName}`,
       className,
    );

    const ownerState = {
        size,
        color,
        variant,
        shadow,
        disabled: rest.disabled ?? loading
    }

    rippleClassName ??= (buttonVariantColor || {})['color']?.replace("text-", "bg-");

    // 5. return
    return (
      <ButtonRoot
        {...rest}
        ref={ref}
        disabled={rest.disabled ?? loading}
        className={classes}
        type={rest.type || "button"}
        ripple={ripple}
        ownerState={ownerState}
        rippleClassName={rippleClassName}
      >
        {loading && <Spinner className={size === "lg" ? 'w-5 h-5' : 'w-4 h-4'} />}
        {startIcon}
        {children}
        {endIcon}
      </ButtonRoot>
    );
  },
);

StyledButton.displayName = "Mux.StyledButton";

export * from './ButtonBase';

export default StyledButton;
