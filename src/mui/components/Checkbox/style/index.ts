import checkboxColors from "./checkboxColors";

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
import { propTypesColor } from "../../../types/components/checkbox";
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
    colors: typeof checkboxColors;
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
  },
  valid: {
    colors: propTypesColor,
  },
  styles: {
    base: {
      root: {
        display: "inline-flex",
        alignItems: "items-center",
      },
      container: {
        className: styles['check'],
        color: 'item-text text-opacity-50'
      },
      input: {
        className: styles['input']
      },
      label: {
        fontWeight: "font-light",
        userSelect: "select-none",
        cursor: "cursor-pointer",
        mt: "mt-px",
      },
      icon: {
        iconClass: styles['icon'],
      },

      disabled: {
        opacity: "opacity-50",
        pointerEvents: "pointer-events-none",
      },
    },
    colors: checkboxColors,

    size:{
       sm: {
        add: styles['sm']
       },
       lg: {
        add: styles['lg']
       }
    }

  },
};

export default checkbox;
