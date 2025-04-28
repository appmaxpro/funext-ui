import type { ReactNode, ElementType } from "react";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Typography component.
 */

// typescript types
export type TextVariants = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "lead" | "paragraph" | "small";
export type TextColors = "inherit" | "current" | "black" | "white" | "light" | "dark" | Colors;
export type asType = ElementType;
export type textGradient = boolean;
export type className = string;
export type children = ReactNode;

// javascript prop-types
export const propTypesVariant: any = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "lead",
  "paragraph",
  "small",
];
export const propTypesColor: any = ["inherit", "current", "black", "white", "light" , "dark", ...propTypesColors];
