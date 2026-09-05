import type { ReactNode } from "react";

export interface ItemInteractive {
  color?: string;
  bg?: string;
  opacity?: string;
}

export interface ListContextValues {
  list?: {
    gap?: string; //"gap-1",
    minWidth?: string; //"min-w-[240px]",
    padding?: string; //"p-2",
    color?: string; //"text-slate-700",
    bg?: string;
  };
  className?: string;
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

export interface ListContextProps {
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
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  divider?: boolean | string;
  gutters?: boolean | string;
  dense?: boolean | string;
  prefix?: string;
  suffix?: string;
  global?: boolean;
  ul?: boolean;
}
