// types
import type {
  placement,
  offset,
  dismiss,
  animate,
  className,
  ArrowProps
} from "../../../types/components/popover";

export interface PopoverStylesType {
  defaultProps?: {
    placement?: placement;
    offset?: offset;
    dismiss?: dismiss;
    animate?: animate;
    className?: className;
    arrow?: ArrowProps
  };
  styles?: {
    base?:object;
    content?: object;

  };
}

export const popover: PopoverStylesType = {
  defaultProps: {
    placement: "bottom",
    offset: 4,
    dismiss: {},
    animate: {
      unmount: {},
      mount: {},
    },
    className: "",
    arrow: {
      props: {
        //maybe enough to set "fill-slate-50 stroke-slate-300 stroke-0" 
        className: `fill-slate-50 
                    [&>path:first-of-type]:stroke-slate-300 
                    [&>path:last-of-type]:fill-slate-50`,
        tipRadius: 2,
        strokeWidth: .25,
        style:{ transform: 'translateY(-1px)' }
      }
    }
  },
  styles: {
    base: {
      d: 'flex flex-col',
      bg: "bg-white",
      p: "p-4",
      border: "border border-slate-300",
      borderRadius: "rounded-lg",
      boxShadow: "shadow-menu",
      fontFamily: "font-sans",
      fontSize: "text-sm",
      fontWeight: "font-normal",
      color: "item-text-7",
      outline: "focus:outline-none",
    },
    content: {
      overflowWrap: "break-words",
      whiteSpace: "whitespace-normal",
    },

  },
};

export default popover;
