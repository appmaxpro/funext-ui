import { FloatingContext, ReferenceType } from "@floating-ui/react";
import type { ReactNode } from "react";

// @floating-ui types
export type {
  FloatingContext,
  UseFloatingReturn,
  ReferenceType,
  Strategy,
  UseRoleProps,
  Side,
  ElementProps
} from "@floating-ui/react";

// generic types
export type {
  DismissProps,
  OffsetProps,
  AnimationProps,
  Placement,
  ArrowProps
} from "../../types";

/**
 * This file contains the types and prop-types for Popper, PopperHandler, PopperContent, PopperContext and Tooltip components.
 */

// typescript types
export type handler = FloatingContext["onOpenChange"];
export type content = () => ReactNode | ReactNode;

export type PopperContextValue = {
  context: FloatingContext<ReferenceType>;
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => any;
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
};

/** @public */
// todo: remove `auto` from PopperWidth
export type PopperWidth = number | 'auto'
