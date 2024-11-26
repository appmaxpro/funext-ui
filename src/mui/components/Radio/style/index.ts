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
      root?: object;
      container?: object;
      input?: object;
      label?: object;
      icon?: object;
      disabled?: object;
    };
    colors: typeof radioColors;
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
      root: {
        display: "inline-flex",
        alignItems: "items-center",
      },
      container: {
        position: "relative",
        display: "flex",
        alignItems: "items-center",
        cursor: "cursor-pointer",
        p: "p-2.5",
        borderRadius: "rounded-full",
        transition: "transition-all",
      },
      input: {
        peer: "peer",
        position: "relative",
        appearance: "appearance-none",
        width: "w-4",
        height: "h-4",
        //borderWidth: "border",
        borderRadius: "rounded-full",
        //borderColor: "border-current",
        cursor: "cursor-pointer",
        transition: "transition-all",
        outline:"ring ring-current",
        opacity: "opacity-50 hover:opacity-80 checked:opacity-100",
        before: {
          content: "before:content['']",
          display: "before:block",
          bg: "before:bg-current",
          width: "before:w-11",
          height: "before:h-11",
          borderRadius: "before:rounded-full",
          position: "before:absolute",
          top: "before:top-2/4",
          left: "before:left-2/4",
          transform: "before:-translate-y-2/4 before:-translate-x-2/4",
          opacity: "before:opacity-0 hover:before:opacity-10",
          
        },
      },
      label: {
        fontWeight: "font-light",
        userSelect: "select-none",
        cursor: "cursor-pointer",
        mt: "mt-px",
      },
      icon: {
        position: "absolute",
        top: "top-2/4",
        left: "left-2/4",
        translate: "-translate-y-2/4 -translate-x-2/4",
        pointerEvents: "pointer-events-none",
        opacity: "opacity-0 peer-checked:opacity-100",
        transition: "transition-opacity",
      },
      disabled: {
        opacity: "opacity-50",
        pointerEvents: "pointer-events-none",
      },
    },
    colors: radioColors,
  },
};

export default radio;
