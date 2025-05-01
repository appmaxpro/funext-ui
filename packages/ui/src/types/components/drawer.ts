import { DismissProps } from "../generic";
/**
 * This file contains the types and prop-types for Drawer component.
 */

// typescript types
export type children = React.ReactNode;
export type Placement = "top" | "right" | "bottom" | "left";
export type OverlayProps = React.ComponentProps<"div">;
export type onClose = () => void;
export type {
  DismissProps,
}
export type OverlayRef = React.Ref<HTMLDivElement>;
