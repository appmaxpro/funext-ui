import { FloatingContext, ReferenceType } from "@floating-ui/react";
import React from "react";

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
export type content =( () => React.ReactNode) | React.ReactNode;
interface PopperContextValue {
  context: FloatingContext<ReferenceType>;
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => any;
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  arrowRef: React.MutableRefObject<HTMLElement|null>;
};


export type {
  PopperContextValue
}

/** @public */
// todo: remove `auto` from PopperWidth
export type PopperWidth = number | 'auto'
