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
      display: "flex flex-row flex-nowrap between",
      alignItems: "items-center",
      p: "p-3",
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
