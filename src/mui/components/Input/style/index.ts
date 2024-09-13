import styles from './input.module.scss';
import inputOutlined from "./inputOutlined";
import inputStandard from "./inputStandard";
import inputStatic from "./inputStatic";

// types
import type {
  variantType,
  sizeType,
  InputColorType,
} from "../../../types/components/input";
import { propTypesVariant, propTypesSize, propTypesColor } from "../../../types/components/input";
import { ReactNode } from 'react';



export interface InputSizeStylesType {
  container?: object;
  input?: object;
  label?: object;
  icon?: object;
}

export interface InputStateStylesType {
  input?: object;
  label?: object;
}

export interface InputVariantStylesType {
  base?: {
    input?: object;
    inputWithIcon?: object;
    icon?: object;
    label?: object;

  };
  sizes?: {
    md?: InputSizeStylesType;
    lg?: InputSizeStylesType;
  };
  colors?: {
    input?: object;
    label?: object;
  };
  error?: InputStateStylesType;
  success?: InputStateStylesType;
  shrink?: InputStateStylesType;

}

export interface InputStylesType {
  defaultProps?: {
    variant?: variantType;
    size?: sizeType;
    color?: InputColorType;
    label?: string;
    error?: boolean;
    success?: boolean;
    icon?: ReactNode;
    labelProps?: any;
    rootProps?: any;
    shrink?: boolean;
    className?: string;
    
  };
  valid?: {
    variants?: string[];
    sizes?: string[];
    colors?: string[];
  };
  styles?: {
    base?: {
      container?: object;
      input?: object;
      label?: object;
      native?: object;
      notched?: string,
      adornments?: {
        props?: object;
        start?: object;
        end?: object;
      };
      icon?: object;
      asterisk?: object;
      disabled?: object;
    };
    variants?: {
      outlined: InputVariantStylesType;
      standard: InputVariantStylesType;
      static: InputVariantStylesType;
    };
  };
}

export const input: InputStylesType = {
  defaultProps: {
    variant: "outlined",
    size: "md",
    color: "primary",
    label: "",
    error: false,
    success: false,
    shrink: false,
    className: "",
  },
  valid: {
    variants: propTypesVariant,
    sizes: propTypesSize,
    colors: propTypesColor,
  },
  styles: {
    base: {
      container: {
        position: "relative",
        width: "w-full",
        minWidth: "min-w-[200px]",
      },
      input: {
        width: "w-full",
        display: "inline-flex flex-row",
        placeItems: "place-items-center",
      },
      native: {
        bg: "peer",
        color: "text-inherit",
        disabled: "disabled:bg-tertiary",
        //default: styles['in']
      },
      adornments: {
        props: {
          position: 'relative',
          height: 'h-full'
        },
        start: {
          flex: styles['adornment']
        },
        end: {
          flex: styles['adornment']
        }
      },
      label: {
        fontWeight: "font-normal",
      },
      asterisk: {
        display: "inline-block",
        color: "text-red-500",
        ml: "ms-0.5",
      },
      disabled:{
        
      }
    },
    variants: {
      outlined: inputOutlined,
      standard: inputStandard,
      static: inputStatic,
    },
  },
};

export default input;
