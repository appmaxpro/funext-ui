import type React from "react";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Slider component.
 */

// typescript types
export type color = Colors;
export type size = "sm" | "md" | "lg";
export type className = string;
export type trackClassName = string;
export type thumbClassName = string;
export type barClassName = string;
export type defaultValue = string | number | readonly string[];
export type value = string | number | readonly string[];
export type onChange = React.ChangeEventHandler<HTMLInputElement>;
export type min = number | string;
export type max = number | string;
export type step = number | string;
export type inputRef = React.RefObject<HTMLInputElement>;
export type inputProps = React.ComponentProps<"input">;

// javascript prop-types
export const propTypesColor: any = propTypesColors;
export const propTypesSize: any = ["sm", "md", "lg"];
