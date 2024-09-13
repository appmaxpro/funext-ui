
// generic types
import type { OffsetProps, DismissProps, AnimationProps, Placement } from "../generic";

/**
 * This file contains the types and prop-types for SpeedDial, SpeedDialHandler and SpeedDialContent component.
 */

// typescript types
export type open = boolean;
export type handler = React.Dispatch<React.SetStateAction<boolean>>;
export type placement = Placement;
export type offset = OffsetProps;
export type dismiss = DismissProps;
export type children = React.ReactNode;
export type animate = AnimationProps;
export type className = string;
