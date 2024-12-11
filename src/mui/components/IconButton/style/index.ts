import buttonFilled from "../../Button/style/buttonFilled";
import buttonGradient from "../../Button/style/buttonGradient";
import buttonOutlined from "../../Button/style/buttonOutlined";
import buttonText from "../../Button/style/buttonText";
import buttonGhost from "../../Button/style/buttonGhost";

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

export interface IconButtonStyleTypes {
  defaultProps?: {
    variant?: variant;
    size?: size;
    color?: color | 'default';
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
    base?: object;
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
    ripple?: object
  };
}

export const iconButton: IconButtonStyleTypes = {
  defaultProps: {
    variant: "text",
    size: "md",
    color: "default",
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
      disabled: "disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none",
      position: "relative",
    },
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
    }
  },
};

export default iconButton;
