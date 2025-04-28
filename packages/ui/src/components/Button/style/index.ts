import buttonFilled from "./buttonFilled";
import buttonGradient from "./buttonGradient";
import buttonOutlined from "./buttonOutlined";
import buttonGhost from "./buttonGhost";
import buttonText from "./buttonText";

import styles from "./btn.module.css";
// types
import type {
  variant,
  size,
  color,
  fullWidth,
  ripple,
  className,
} from "../../../types/components/button";
import { propTypesVariant, propTypesSize, propTypesColor } from "../../../types/components/button";

export interface ButtonStyleTypes {
  defaultProps?: {
    variant?: variant;
    size?: size;
    color?: color;
    fullWidth?: fullWidth;
    ripple?: ripple;
    className?: className;
  };
  valid?: {
    variants?: string[];
    sizes?: string[];
    colors?: string[];
  };
  styles?: {
    base?: {
      initial?: object;
      fullWidth?: object;
    };
    shadow?: string,
    sizes?: {
      sm?: object;
      md?: object;
      lg?: object;
    };
    variants?: {
      filled?: typeof buttonFilled;
      gradient?: typeof buttonGradient;
      outlined?: typeof buttonOutlined;
      text?: typeof buttonText;
      ghost?: typeof buttonGhost;
    };
    variantMap?: {
      filled?: (props:any, theme:any) => any;
      gradient?: (props:any, theme:any) => any;
      outlined?: (props:any, theme:any) => any;
      text?: (props:any, theme:any) => any;
      ghost?: (props:any, theme:any) => any;
    },
    ripple?: object
  };
}

export const button: ButtonStyleTypes = {
  defaultProps: {
    variant: "filled",
    size: "md",
    color: "primary",
    fullWidth: false,
    ripple: true,
    className: "",
  },
  valid: {
    variants: propTypesVariant,
    sizes: propTypesSize,
    colors: propTypesColor,
  },
  styles: {
    base: {
      initial: {
        //className: styles['btn'],
      },
      fullWidth: {
        width: "w-full",
      },
    },
    shadow: 'fill-button-shadow',
    sizes: {
      sm: {
      },
      md: {
      },
      lg: {
      },
    },
    variants: {
      filled: buttonFilled,
      gradient: buttonGradient,
      outlined: buttonOutlined,
      text: buttonText,
      ghost: buttonGhost
    },
    ripple: {
      filled: 'color',
      gradient: 'color',
      outlined: 'color',
      text: 'color',
      ghost: 'color'
    },
    variantMap: {
      filled: ({hasColor, color}, theme:any) =>{
          if (hasColor) {
             return {
              classes: {
                background: `bg-${color}-500`,
                color: `text-${color}-50`,
                focus: `focus:bg-${color}-700`,
                active: `active:bg-${color}-600`
              }
             }
          }
          if(color) {
            return {
              style: {
                backgroundColor: `bg-${color}-500`,
                color: `text-${color}-50`,
                focus: `focus:bg-${color}-700`,
                active: `active:bg-${color}-600`
              }
            }
          }
      }
    }
  },
};

export default button;
