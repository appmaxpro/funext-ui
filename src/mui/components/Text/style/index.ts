import textColors from "./textColors";

// types
import type {
  TextVariants,
  TextColors,
  asType,
  textGradient,
  className,
} from "../../../types/components/text";
import { propTypesVariant, propTypesColor } from "../../../types/components/text";

export interface TypographyStylesType {
  defaultProps?: {
    variant?: TextVariants;
    color?: TextColors;
    as?: asType;
    textGradient?: textGradient;
    className?: className;
  };
  valid?: {
    variants?: string[];
    colors?: string[];
  };
  styles?: {
    variants?: {
      h1?: object;
      h2?: object;
      h3?: object;
      h4?: object;
      h5?: object;
      h6?: object;
      lead?: object;
      paragraph?: object;
      small?: object;
    };
    textGradient?: object;
    colors?: typeof textColors;
  };
}

export const typography: TypographyStylesType = {
  defaultProps: {
    variant: "paragraph",
    color: "inherit",
    textGradient: false,
    className: "",
  },
  valid: {
    variants: [],
    colors: propTypesColor,
  },
  styles: {
    variants: {
      
    },
    textGradient: {
      bgClip: "bg-clip-text",
      color: "text-transparent",
    },
    colors: textColors,
  },
};

export default typography;
