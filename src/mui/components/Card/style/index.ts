import cardFilled from "./cardFilled";
import cardGradient from "./cardGradient";
import cardOutlined from './cardOutlined';

// types
import type { variant, color, shadow, floated, className } from "../../../types/components/card";
import { propTypesVariant, propTypesColor } from "../../../types/components/card";

export interface CardStylesType {
  defaultProps?: {
    variant?: variant;
    color?: color;
    shadow?: shadow;
    className?: className;
  };
  valid?: {
    variants?: string[];
    colors?: string[];
  };
  styles?: {
    base?: {
      initial?: object;
      shadow?: object;
    };
    variants?: {
      filled?: typeof cardFilled;
      gradient?: typeof cardOutlined;
      outlined?: typeof cardGradient;
    };
  };
}

const card: CardStylesType = {
  defaultProps: {
    variant: "outlined",
    className: "",
  },
  valid: {
    variants: propTypesVariant,
    colors: propTypesColor,
  },
  styles: {
    base: {
      initial: {
        backgroundClip: "bg-clip-border",
      },
      shadow: {
        boxShadow: "shadow-md",
      },
    },
    variants: {
      filled: cardFilled,
      gradient: cardGradient,
      outlined: cardOutlined
    },
  },
};

export default card;
