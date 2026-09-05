import type { ReactElement, ReactNode } from "react";

// @floating-ui types
import type { ContextData } from "@floating-ui/react";

// generic types
import type { Colors, DismissProps, OffsetProps, AnimationProps } from "../generic";
import { propTypesColors } from "../generic";
import type React from "react";

/**
 * This file contains the types and prop-types for Select, SelectOption and SelectContext components.
 */

// typescript types
export type variant = "standard" | "outlined" | "static";
export type size = "md" | "lg";
export type color = Colors;
export type label = string;
export type error = boolean;
export type success = boolean;
export type arrow = ReactNode;
export type value = string;
export type onChange = (value?: string) => void;
export type selected = (element?: ReactElement, index?: number) => React.ReactNode;
export type offset = OffsetProps;
export type dismiss = DismissProps;
export type animate = AnimationProps;
export type autoHeight = boolean;
export type lockScroll = boolean;
export type labelProps = {
  [key: string]: any;
};
export type menuProps = {
  [key: string]: any;
};
export type index = number;
export type disabled = boolean;
export type className = string;
export type name = string;
export type children = ReactNode;
export type containerProps = React.ComponentProps<"div">;
export type contextValue = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  activeIndex?: number | null;
  setActiveIndex: (index: number | null) => void;
  listRef: React.MutableRefObject<Array<HTMLLIElement | null>>;
  setOpen: (open: boolean) => void;
  onChange: (value: string) => void;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  dataRef: ContextData;
};

// javascript prop-types
export const propTypesVariant: any = ["standard", "outlined", "static"];
export const propTypesSize: any = ["md", "lg"];
export const propTypesColor: any = ["black", "white", ...propTypesColors];