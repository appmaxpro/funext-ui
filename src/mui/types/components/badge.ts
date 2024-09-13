import type { ReactNode } from "react";
import PropTypes from "prop-types";

// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

/**
 * This file contains the types and prop-types for Badge component.
 */

// typescript types
export type color = "white" | Colors;
export type invisible = boolean;
export type withBorder = boolean;
export type overlap = "circular" | "square";
export type placement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type className = string;
export type content = ReactNode;
export type children = ReactNode;
export type containerProps = React.HTMLAttributes<HTMLDivElement>;
export type containerRef = React.Ref<HTMLDivElement>;

// javascript prop-types
export const propTypesColor: any = ["white", ...propTypesColors];
export const propTypesOverlap: any = ["circular", "square"];
export const propTypesPlacement: any = ["top-start" , "top-end" , "bottom-start" , "bottom-end"];