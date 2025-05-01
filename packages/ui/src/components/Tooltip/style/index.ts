// types
import type {
  interactive,
  placement,
  offset,
  dismiss,
  animate,
  className,
  ArrowProps
} from "../../Popover/Popover";

export interface TooltipStylesType {
  defaultProps?: {
    interactive?: interactive;
    placement?: placement;
    offset?: offset;
    dismiss?: dismiss;
    animate?: animate;
    className?: className;
    arrow?:ArrowProps;
  };
  styles?: {
    base?: object;
  };
}

export const tooltip: TooltipStylesType = {
  defaultProps: {
    interactive: false,
    placement: "bottom",
    offset: 5,
    dismiss: {},
    animate: {
      unmount: {},
      mount: {},
    },
    className: "",
    arrow: {
      props: {
        className: "fill-slate-900",
        tipRadius: 2,
        style:{ transform: 'translateY(-1px)' }
      }
    }
  },
  styles: {
    base: {
      bg: "bg-slate-900",
      py: "py-1.5",
      px: "px-3",
      borderRadius: "rounded-lg",
      fontFamily: "font-sans",
      fontSize: "text-sm",
      fontWeight: "font-normal",
      color: "text-white",
      outline: "focus:outline-none",
      overflowWrap: "break-words",
      zIndex: "z-tooltip",
      whiteSpace: "whitespace-normal",
    },
  },
};

export default tooltip;
