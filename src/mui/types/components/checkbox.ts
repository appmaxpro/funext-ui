import type { ReactNode } from "react";

// generic types
import type { Colors } from "../generic";
export { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Checkbox, Radio and Switch components.
 */

// typescript types
export type color = Colors;
export type label = ReactNode;
export type icon = ReactNode;
export type ripple = boolean;
export type className = string;
export type disabled = boolean;

export type objectType = {
  [key: string]: any;
};