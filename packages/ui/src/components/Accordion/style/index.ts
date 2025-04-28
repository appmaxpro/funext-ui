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
      },
      header: {
        initial: {
          width: "w-full",
          py: "py-4",
          borderWidth: "border-b",
          textAlign: "text-justify",
        },
        active: { 
          color: "text-item" 
        },
        icon: {
          ml: "ms-4",
        },
      },
      body: {
        display: "block",
        width: "w-full",
        py: "py-4",
      },
      disabled: {
        pointerEvents: "pointer-events-none",
        opacity: "opacity-50",
      },
    },
  },
};

export default accordion;
