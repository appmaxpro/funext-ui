import type { ReactNode } from "react";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Button and IconButton component.
 */

// typescript types
export type variant = "filled" | "outlined" | "gradient" | "text" | "ghost";
export type size = "sm" | "md" | "lg";
export type color = "white" | "black" | "default" | "transparent" | 'inherit' | Colors ;
export type fullWidth = boolean;
export type ripple = boolean;
export type className = string;
export type children = ReactNode;
export type loading = boolean;

// javascript prop-types
export const propTypesVariant: any = ["filled", "outlined", "gradient", "text", "ghost"];
export const propTypesSize: any = ["sm", "md", "lg"];
export const propTypesColor: any = ["white", "black", "default", "transparent", 'inherit', ...propTypesColors];
