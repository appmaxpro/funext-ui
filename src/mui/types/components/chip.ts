import type { ReactNode } from "react";

// generic types
import type { Colors, AnimationProps } from "../generic";
import {propTypesColors} from "../generic";
/**
 * This file contains the types and prop-types for Chip component.
 */

// typescript types
export type variant = "filled" | "gradient" | "outlined" | "ghost";
export type size = "sm" | "md" | "lg";
export type color = Colors;
export type icon = ReactNode;
export type open = boolean;
export type onClose = () => void;
export type action = ReactNode;
export type dismissible = {
  action?: ReactNode;
  onClose: () => void;
};
export type animate = AnimationProps;
export type className = string;
export type value = ReactNode;

// javascript prop-types
export const propTypesVariant: any = ["filled", "gradient", "outlined", "ghost"];
export const propTypesColor:string[] = ["white", "black", ...propTypesColors];
export const propTypesSize: any = ["xs", "sm", "md"];