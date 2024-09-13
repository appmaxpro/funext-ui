import type { ReactNode } from "react";

export interface ItemInteractive {
  color?: string;
  bg?: string;
  opacity?: string;
}

export interface ListContextValues {
  list?: {
    gap: string;//"gap-1",
    minWidth: string;//"min-w-[240px]",
    padding: string;//"p-2",
    fontFamily: string;//"font-sans",
    fontSize: string;//"text-base",
    fontWeight: string;//"font-normal",
    color: string;//"text-slate-700",
    bg: string;
  };
  className?: string,
  item?: {
    className?: string,
    rippleClassName?: string;
    hover?: ItemInteractive | string;
    focus?: ItemInteractive | string;
    active?: ItemInteractive | string;
    selected?: ItemInteractive | string;
    disabled?: ItemInteractive | string;
    
  },
  hover?:boolean;
  select?:boolean;
  active?:boolean;
  focus?:boolean;
  ripple?: boolean;
}

export interface ListContextProps {
   getItemStyle: (disabled?:Boolean, selected?:Boolean, active?:Boolean, useHover?: boolean) => string | undefined;
   list?: string;
   item:{
    hover?: string;
    focus?: string;
    active?: string;
    selected?: string;
    disabled?: string;
    default?: string;
    all?: string;
    ripple?: boolean;
    rippleClassName?: string;
   }
}
