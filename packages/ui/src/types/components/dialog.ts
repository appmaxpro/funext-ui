import type { ReactNode } from "react";

// generic types
import type { DismissProps, AnimationProps } from "../generic";

/**
 * This file contains the types and prop-types for Dialog, DialogHeader, DialogBody and DialogFooter components.
 */

// typescript types
export type open = boolean;
export type handler = React.Dispatch<React.SetStateAction<any>>;
export type size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type dismiss = DismissProps;
export type animate = AnimationProps;
export type divider = boolean;
export type className = string;
export type children = ReactNode;

// javascript prop-types
export const propTypesSize: any = ["xs", "sm", "md", "lg", "xl", "xxl"];

