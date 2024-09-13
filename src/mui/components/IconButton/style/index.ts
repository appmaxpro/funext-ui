import buttonFilled from "../../Button/style/buttonFilled";
import buttonGradient from "../../Button/style/buttonGradient";
import buttonOutlined from "../../Button/style/buttonOutlined";
import buttonText from "../../Button/style/buttonText";

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
import styles from './ib.module.scss';

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
    colors: [...propTypesColor, 'transparent', 'inherit', 'default'],
  },
  styles: {
    base: {
      disabled: "disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none",
      position: "relative",
      //default: Object.values(styles).join(' ')
    },
    sizes: {
      sm: {
        fontSize: "text-lg",
      },
      md: {
        fontSize: "text-2xl",
      },
      lg: {
        fontSize: "text-3xl",
      },
    },
    variants: {
      filled: buttonFilled,
      gradient: buttonGradient,
      outlined: buttonOutlined,
      text: buttonText,
    },
    ripple: {
      filled: 'color',
      gradient: 'color',
      outlined: 'color',
      text: 'color'
    }
  },
};

export default iconButton;
