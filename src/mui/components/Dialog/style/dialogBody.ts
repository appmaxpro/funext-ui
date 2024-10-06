// types
import type { className, divider } from "../../../types/components/dialog";

export interface DialogBodyStylesType {
  defaultProps?: {
    className?: className;
    divider?: divider;
  };
  styles?: {
    base?: {
      initial?: object;
      divider?: object;
    };
  };
}

export const dialogBody: DialogBodyStylesType = {
  defaultProps: {
    className: "",
    divider: false,
  },
  styles: {
    base: {
      initial: {
        position: "relative",
        p: "p-4",
        overflowY: "overflow-y-auto",
        grow: 'grow'
      },
      divider: {
        borderTop: "border-y"
      },
    },
  },
};

export default dialogBody;
