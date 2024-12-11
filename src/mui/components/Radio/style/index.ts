import radioColors from "./radioColors";

// types
import type {
  color,
  label,
  icon,
  ripple,
  className,
  objectType,
  disabled,
} from "../../../types/components/checkbox";
import { propTypesColors } from "../../../types/components/checkbox";

export interface RadioStylesType {
  defaultProps?: {
    color?: color;
    label?: label;
    icon?: icon;
    ripple?: ripple;
    className?: className;
    disabled?: disabled;
    containerProps?: objectType;
    labelProps?: objectType;
    iconProps?: objectType;
  };
  valid?: {
    colors?: string[];
  };
  styles?: {
    base?: {
      
    };
  };
}

export const radio: RadioStylesType = {
  defaultProps: {
    color: "primary",
    label: undefined,
    icon: undefined,
    ripple: true,
    className: "",
    disabled: false,
    containerProps: undefined,
    labelProps: undefined,
    iconProps: undefined,
  },
  valid: {
    colors: propTypesColors,
  },
  styles: {
    base: {
      
    }
  },
};

export default radio;
