import type { ReactNode } from "react";

export interface ItemInteractive {
  color?: string;
  bg?: string;
  opacity?: string;
}


export interface ListContextValues {
  className?: string; //"gap-1 min-w-[240px] p-2  text-slate-700"
  item?: {
    className?: string;
    rippleClassName?: string;
    hover?: ItemInteractive | string;
    focus?: ItemInteractive | string;
    active?: ItemInteractive | string;
    selected?: ItemInteractive | string;
    disabled?: ItemInteractive | string;
    initial?: any;
  };
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  hover?: boolean;
  select?: boolean;
  active?: boolean;
  focus?: boolean;
  ripple?: boolean;
  ul?: boolean;
  divider?: boolean | string;
  gutters?: boolean | string;
  dense?: boolean | string;
  prefix?: string;
  suffix?: string;
  global?: boolean;

}


export interface ListContextResult {
  getItemStyle: (
    disabled?: Boolean,
    selected?: Boolean,
    active?: Boolean,
    useHover?: boolean,
    divider?: boolean,
    gutters?: boolean,
    dense?: boolean,
  ) => string | undefined;
  list?: string;
  item: {
    hover?: string;
    focus?: string;
    active?: string;
    selected?: string;
    disabled?: string;
    default?: string;
    all?: string;
    ripple?: boolean;
    rippleClassName?: string;
  };
  prefix?: string;
  suffix?: string;
  base?: ListContextValues;
}
