import type { ReactNode } from "react";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Timeline components.
 */

// typescript types
export type className = string;
export type children = ReactNode;
export type color = "white" | Colors;
export type variant = "filled" | "outlined" | "ghost" | "gradient";

// javascript prop-types
export const propTypeColor: any = ["white", ...propTypesColors];
export const propTypeVariant: any = ["filled", "outlined", "ghost", "gradient"];
