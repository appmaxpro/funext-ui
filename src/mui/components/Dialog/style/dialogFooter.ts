// types
import type { className } from "../../../types/components/dialog";

export interface DialogFooterStylesType {
  defaultProps?: {
    className?: className;
  };
  styles?: {
    base?: object;
    divider?: object;
  };
}

export const dialogFooter: DialogFooterStylesType = {
  defaultProps: {
    className: "",
  },
  styles: {
    base: {
    },
    divider: {
      borderTop: "border-t"
    },
  },
};

export default dialogFooter;
