import type { ReactNode } from "react";

// generic types
import type {AnimationProps} from "../generic";

/**
 * This file contains the types and prop-types for Tabs and TabsHeader, TabsBody, Tab, TabPanel, and TabsContext components.
 */

// typescript types
export type id = string;
export type value = string | number;
export type animate = AnimationProps;
export type disabled = boolean;
export type className = string;
export type isInitial = boolean;
export type orientation = "horizontal" | "vertical";
export type indicatorProps = {
  [key: string]: any;
};
export type children = ReactNode;
