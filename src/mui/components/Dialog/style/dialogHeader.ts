// types
import type { className } from "../../../types/components/dialog";

export interface DialogHeaderStylesType {
  defaultProps?: {
    className?: className;
  };
  styles?: {
    base?: object;
    title?: object;
    divider?: object;
  };
}

export const dialogHeader: DialogHeaderStylesType = {
  defaultProps: {
    className: "",
  },
  styles: {
    base: {
    },
    title: {
      grow: "grow",
      lineHeight: "leading-snug",
    },
    divider: {
      borderTop: "border-b"
    },
  },
};

export default dialogHeader;
