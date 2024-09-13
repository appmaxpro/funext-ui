import { DismissProps } from "../generic";
import type { Transition } from "framer-motion";
/**
 * This file contains the types and prop-types for Drawer component.
 */

// typescript types
export type open = boolean;
export type size = number;
export type overlay = boolean;
export type children = React.ReactNode;
export type placement = "top" | "right" | "bottom" | "left";
export type overlayProps = React.ComponentProps<"div">;
export type className = string;
export type onClose = () => void;
export type dismiss = DismissProps;
export type transition = Transition; 
export type overlayRef = React.Ref<HTMLDivElement>;
