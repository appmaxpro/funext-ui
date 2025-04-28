// types
import type { AnimationProps } from "../../../types/components/collapse";

export interface CollapseStylesType {
  defaultProps?: {
    animate?: AnimationProps;
    className?: string;
  };
  styles?: {
    base?: object;
  };
}

export const collapse: CollapseStylesType = {
  defaultProps: {
    animate: {
      unmount: {},
      mount: {},
    },
    className: "",
  },
  styles: {
    base: {
      display: "block",
      overflow: "overflow-hidden",
    },
  },
};

export default collapse;
