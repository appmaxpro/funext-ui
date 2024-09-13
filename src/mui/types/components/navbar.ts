import type { ReactNode } from "react";

// generic types
import type { Colors, AnimationProps } from "../generic";
import { propTypesColors} from "../generic";
/**
 * This file contains the types and prop-types for Navbar component.
 */

// typescript types
export type variant = "filled" | "gradient";
export type color = "transparent" | "white" | Colors;
export type shadow = boolean;
export type blurred = boolean;
export type fullWidth = boolean;
export type className = string;
export type children = ReactNode;
export type open = boolean;
export type animate = AnimationProps;

// javascript prop-types
export const propTypesVariant: any = ["filled", "gradient"];
export const propTypesColor: any = ["transparent", "white", ...propTypesColors];

