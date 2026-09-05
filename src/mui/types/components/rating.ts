import type { ReactNode } from "react";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Rating component.
 */

// typescript types
type iconType = ReactNode | React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;

export type count = number;
export type value = number;
export type ratedIcon = iconType;
export type unratedIcon = iconType;
export type color = "white" | Colors;
export type className = string;
export type onChange = (value: number) => void;
export type readonly = boolean;

export const propTypesColor: any = ["white", ...propTypesColors];

