import type { ReactNode } from "react";

// @floating-ui types
import type { FloatingContext, Placement, ReferenceType, Strategy } from "@floating-ui/react";

// generic types
import type { DismissProps, OffsetProps, ArrowProps, AnimationProps } from "../generic";

/**
 * This file contains the types and prop-types for Popover, PopoverHandler, PopoverContent, PopoverContext and Tooltip components.
 */

// typescript types
export type open = boolean;
export type handler = React.Dispatch<React.SetStateAction<any>>;
export type placement = Placement;
export type offset = OffsetProps;
export type dismiss = DismissProps;
export type animate = AnimationProps;
export type content = () => ReactNode | ReactNode;
export type contextValue = {
  open: open;
  strategy: Strategy;
  x?: number;
  y?: number;
  context: FloatingContext<ReferenceType>;
  reference: (node: HTMLElement) => void;
  floating: (node: HTMLElement) => void;
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => any;
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  appliedAnimation: animate;
  labelId: string;
  descriptionId: string;
  arrowRef: React.MutableRefObject<HTMLElement | null>;
  arrow?: ArrowProps
};
export type interactive = boolean;
export type className = string;
export type children = ReactNode;
export {type ArrowProps};