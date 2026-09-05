
// types
import type {
  color,
  label,
  icon,
  ripple,
  className,
  disabled,
  objectType,
} from "../../../types/components/checkbox";
import { propTypesColors } from "../../../types/components/checkbox";
import styles from './ch.module.scss';

export interface CheckboxStylesType {
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
    size: 'sm' | 'md' | 'lg'
  };
  valid?: {
    colors?: string[];
  };
  styles?: {
    base?: {
      root?: object;
      container?: object;
      input?: object;
      label?: object;
      icon?: object;
      disabled?: object;
      iconClass?: string;

    };
    size: {
      sm?: object;
      md?: object;
      lg?: object;
    }
  };
}

export const checkbox: CheckboxStylesType = {
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
    size: 'md'
  },
  valid: {
    colors: propTypesColors,
  },
  styles: {
    base: {
      
    },
    size:{
      
    }

  },
};

export default checkbox;
