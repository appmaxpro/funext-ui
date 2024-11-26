
// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Spinner component.
 */

// typescript types
export type color = Colors | "white" | "black" | "current";
export type className = string;

// javascript prop-types
export const propTypesColor: any = ["white", "black", "current", ...propTypesColors];
