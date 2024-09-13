import chipFilled from "./chipFilled";
import chipGradient from "./chipGradient";
import chipOutlined from "./chipOutlined";
import chipGhost from "./chipGhost";

// types
import type {
  variant,
  size,
  color,
  icon,
  open,
  onClose,
  action,
  animate,
  className,
} from "../../../types/components/chip";
import { propTypesVariant, propTypesColor, propTypesSize } from "../../../types/components/chip";

export interface ChipStylesType {
  defaultProps?: {
    variant?: variant;
    size?: size;
    color?: color;
    icon?: icon;
    open?: open;
    onClose?: onClose;
    action?: action;
    animate?: animate;
    className?: className;
  };
  valid?: {
    variants?: string[];
    sizes?: string[];
    colors?: string[];
  };
  styles?: {
    base?: {
      chip?: object;
      action?: object;
      icon?: object;
    };
    sizes?: {
      sm?: object;
      md?: object;
      lg?: object;
    };
    variants?: {
      filled?: typeof chipFilled;
      gradient?: typeof chipGradient;
      outlined?: typeof chipOutlined;
      ghost?: typeof chipGhost;
    };
  };
}

export const chip: ChipStylesType = {
  defaultProps: {
    variant: "filled",
    size: "md",
    color: "primary",
    icon: undefined,
    open: true,
    onClose: undefined,
    action: undefined,
    animate: {
      unmount: {},
      mount: {},
    },
    className: "",
  },
  valid: {
    variants: propTypesVariant,
    sizes: propTypesSize,
    colors: propTypesColor,
  },
  styles: {
    base: {
      chip: {
        position: "relative",
        display: "inline-flex",
        nowrap: "flex-nowrap",
        placeItems: "items-center",
        fontFamily: "font-sans",
        fontWeight: "font-bold",
        textTransform: "uppercase",
        lineHeight: "leading-none",
        whiteSpace: "whitespace-nowrap",
        userSelect: "select-none",
      },
      action: {
        shrink: 'shrink p-0'
      },
      icon: {
        shrink: 'shrink'
      },
    },
    sizes: {
      sm: {
        chip: {
          py: "py-0.5",
          px: "px-1",
          fontWeight: "font-medium",
          fontSize: "text-xs",
          borderRadius: "rounded-sm",
        },
        action: {
        },
        icon: {
        },
      },
      md: {
        chip: {
          py: "py-1",
          px: "px-2",
          fontSize: "text-xs",
          borderRadius: "rounded-md",
        },
        action: {
        },
        icon: {
        },
      },
      lg: {
        chip: {
          py: "py-1.5",
          px: "px-3",
          fontSize: "text-xs",
          borderRadius: "rounded-md",
        },
        action: {
        },
        icon: {
        },
      },
    },
    variants: {
      filled: chipFilled,
      gradient: chipGradient,
      outlined: chipOutlined,
      ghost: chipGhost,
    },
  },
};

export default chip;
