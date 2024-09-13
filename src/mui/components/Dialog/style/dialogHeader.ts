// types
import type { className } from "../../../types/components/dialog";

export interface DialogHeaderStylesType {
  defaultProps?: {
    className?: className;
  };
  styles?: {
    base?: object;
    title?: object;
  };
}

export const dialogHeader: DialogHeaderStylesType = {
  defaultProps: {
    className: "",
  },
  styles: {
    base: {
      display: "flex flex-row flex-nowrap between",
      alignItems: "items-start",
      p: "p-4",
    },
    title: {
      grow: "grow",
      
      color: "item-text-9",
      fontSmoothing: "antialiased",
      fontFamily: "font-sans",
      fontSize: "text-2xl",
      fontWeight: "font-semibold",
      lineHeight: "leading-snug",
    }
  },
};

export default dialogHeader;
