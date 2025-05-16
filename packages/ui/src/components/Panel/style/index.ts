import panelFilled from "./panelFilled";
import panelGradient from "./panelGradient";
import panelOutlined from './panelOutlined';

// types
import type { variant, color} from "../types";
import { propTypesVariant, propTypesColor } from "../types";

export interface PanelStylesType {
  defaultProps?: {
    variant?: variant;
    color?: color;
  };
  valid?: {
    variants?: string[];
    colors?: string[];
  };
  styles?: {
    base?: {
      initial?: object;
      shadow?: object;
    };
    variants?: {
      elevation: object,
      filled?: typeof panelFilled;
      gradient?: typeof panelGradient;
      outlined?: typeof panelOutlined;
    };
  };
}

const panel: PanelStylesType = {
  defaultProps: {
  },
  valid: {
    variants: propTypesVariant,
    colors: propTypesColor,
  },
  styles: {
    base: {
      initial: {
      },
    },
    variants: {
      elevation: {},
      filled: panelFilled,
      gradient: panelGradient,
      outlined: panelOutlined,
    },
  },
};

export default panel;
