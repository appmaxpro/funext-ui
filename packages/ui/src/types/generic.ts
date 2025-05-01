
import type { UseDismissProps, Placement, Strategy, OffsetOptions} from "@floating-ui/react";
import { PresenceProps } from "../lib/presence";

// typescript types
export type Colors =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "error"
  | "warning"
  | "info"
  | "slate"
  | "gray"
  | "orange"
  | "amber"
  | "green"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "red";


export type AnimationProps = {
  initial?: object;
  mount?: object;
  unmount?: object;
};


export {Placement, Strategy, OffsetOptions};

export interface DismissProps extends UseDismissProps {}

export type OffsetProps = OffsetOptions;

export interface NewAnimatePresenceProps extends Omit<PresenceProps, "children"> {
  children: React.ReactNode;
}

// javascript prop-types
export const propTypesColors: string[] = [
  "primary",
  "secondary",
  "slate",
  "gray",
  "orange",
  "amber",
  "green",
  "cyan",
  "blue",
  "sky",
  "indigo",
  "purple",
  "pink",
  "red",
];


export const propTypesPlacements: string[] = [
  "top-start",
  "top",
  "top-end",
  "right-start",
  "right",
  "right-end",
  "bottom-start",
  "bottom",
  "bottom-end",
  "left-start",
  "left",
  "left-end",
];

export interface ArrowProps {
  className?: string;
  fill?: string;
  stroke?: string;
  height?:number;
  width?: number;
  strokeWidth?: number;
  tipRadius?: number;
  style?: React.CSSProperties;
}

export type OverlayProps = React.ComponentProps<'div'> & {lockScroll?: boolean};