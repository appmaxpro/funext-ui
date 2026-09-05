import type { ReactNode, ReactElement, JSXElementConstructor } from "react";

/**
 * This file contains the types and prop-types for Stepper and Step components.
 */

// typescript types
export type activeStep = number;
export type isLastStep = (arg: boolean) => void;
export type isFirstStep = (arg: boolean) => void;
export type children = ReactNode;
export type className = string;

