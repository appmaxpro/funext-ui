// types
//import { Transition } from "framer-motion";
import type {
  Placement,
  OverlayProps,
  DismissProps,
  onClose,
  Transition,
} from "../../../types/components/drawer";

export interface DrawerStylesType {
  defaultProps?: {
    size?: number;
    overlay?: boolean;
    placement?: Placement;
    overlayProps?: OverlayProps;
    className?: string;
    dismiss?: DismissProps;
    onClose?: onClose;
    transition?: Transition;
  };
  styles?: {
    base?: {
      container?: object;
      overlay?: object;
      drawer?: object;
    };
  };
}

export const drawer: DrawerStylesType = {
  defaultProps: {
    size: 300,
    overlay: true,
    placement: "left",
    overlayProps: undefined,
    className: "",
    dismiss: undefined,
    onClose: undefined,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.3,
    },
  },
  styles: {
    base: {
      drawer: {
        pointerEvents: "pointer-events-auto",
        boxSizing: "box-border",
        boxShadow: "shadow-2xl shadow-slate-900/10",
      },
      overlay: {
        position: "absolute",
        inset: "inset-0",
        width: "w-full",
        height: "h-full",
        pointerEvents: "pointer-events-auto",
        backgroundColor: "bg-black",
        backgroundOpacity: "bg-opacity-60",
        backdropBlur: "backdrop-blur-sm",
      },
    },
  },
};

export default drawer;
