
// types
import type {
  color,
  label,
  ripple,
  className,
  disabled,
  objectType,
} from "../../../types/components/checkbox";
import { propTypesColors } from "../../../types/components/checkbox";

export interface SwitchButtonStylesType {
  defaultProps?: {
    color?: color;
    label?: label;
    ripple?: ripple;
    className?: className;
    disabled?: disabled;
    containerProps?: objectType;
    labelProps?: objectType;
    circleProps?: objectType;
  };
  valid?: {
    colors?: string[];
  };
  styles?: {
    base?: {
    };
  };
}

export const switchButton: SwitchButtonStylesType = {
  defaultProps: {
    color: "primary",
    label: "",
    ripple: true,
    className: "",
    disabled: false,
    containerProps: undefined,
    labelProps: undefined,
    circleProps: undefined,
  },
  valid: {
    colors: propTypesColors,
  },
  styles: {
    base: {
      
    }
  },
};

export default switchButton;
