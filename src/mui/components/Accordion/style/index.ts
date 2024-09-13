import { AnimationProps } from "../../../types/generic";
// types
export interface AccordionStylesType {
  defaultProps?: {
    icon?: object;
    className?: string;
    animate?: AnimationProps;
    disabled?: boolean;
  };
  styles?: {
    base?: {
      container?: object;
      header?: {
        initial?: object;
        active?: object;
        icon?: object;
      };
      body?: object;
      disabled?: object;
    };
  };
}

export const accordion: AccordionStylesType = {
  defaultProps: {
    icon: undefined,
    className: "",
    animate: {
      unmount: {},
      mount: {},
    },
    disabled: false,
  },
  styles: {
    base: {
      container: {
        display: "block",
        position: "relative",
        width: "w-full",
        color: "text-item-2",
      },
      header: {
        initial: {
          display: "flex",
          justifyContent: "justify-between",
          alignItems: "items-center",
          width: "w-full",
          py: "py-4",
          borderWidth: "border-b border-b-slate-100",
          fontSmoothing: "antialiased",
          fontFamily: "font-sans",
          fontSize: "text-xl",
          textAlign: "text-justify",
          fontWeight: "font-semibold",
          lineHeight: "leading-snug",
          userSelect: "select-none",
          hover: "hover:text-item",
          transition: "transition-colors",
        },
        active: { color: "text-item" },
        icon: {
          ml: "ms-4",
        },
      },
      body: {
        display: "block",
        width: "w-full",
        py: "py-4",
        fontSmoothing: "antialiased",
        fontFamily: "font-sans",
        fontSize: "text-sm",
        fontWeight: "font-light",
        lineHeight: "leading-normal",
      },
      disabled: {
        pointerEvents: "pointer-events-none",
        opacity: "opacity-50",
      },
    },
  },
};

export default accordion;
