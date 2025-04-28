import type { ReactNode } from "react";

// generic types
import type { Colors, AnimationProps } from "../generic";
import {propTypesColors} from "../generic";

/**
 * This file contains the types and prop-types for Alert component.
 */

// typescript types
export type variant = "filled" | "outlined" | "ghost";
export type color = Colors;
export type icon = ReactNode;
export type open = boolean;
export type onClose = (event: React.SyntheticEvent | Event) => void;
export type action = ReactNode;
export type animate = AnimationProps | boolean;
export type className = string;
export type children = ReactNode;

// javascript prop-types
export const propTypesVariant: any = ["filled", "outlined", "ghost"];
export const propTypesColor:string[] = ["white", "black", "transparent", "default", ...propTypesColors];

