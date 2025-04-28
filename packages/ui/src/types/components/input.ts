import type { ReactNode } from "react";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Input and Textarea components.
 */

// typescript types
export type variantType = "standard" | "outlined" | "filled";
export type sizeType = "md" | "lg";
export type InputColorType = "black" | "white" | Colors;
export type labelProps = {
  [key: string]: any;
};
export type containerProps = {
  [key: string]: any;
};
export type shrink = boolean;
export type className = string;

// javascript prop-types
export const propTypesVariant: any = ["standard", "outlined", "filled"];
export const propTypesSize: any = ["md", "lg"];
export const propTypesColor: any = ["black", "white", ...propTypesColors];
