import { ArrowProps, Placement } from "./types";

export const DEFAULT_POPPER_DISTANCE = 4;
export const DEFAULT_POPPER_PADDING = 4;
export const DEFAULT_POPPER_ARROW_WIDTH = 19;
export const DEFAULT_POPPER_ARROW_HEIGHT = 8;
export const DEFAULT_POPPER_ARROW_RADIUS = 2;
export const DEFAULT_FALLBACK_PLACEMENTS: Record<Placement, Placement[]> = {
  top: ["bottom", "left", "right"],
  "top-start": ["bottom-start", "left-start", "right-start"],
  "top-end": ["bottom-end", "left-end", "right-end"],
  bottom: ["top", "left", "right"],
  "bottom-start": ["top-start", "left-start", "right-start"],
  "bottom-end": ["top-end", "left-end", "right-end"],
  left: ["right", "top", "bottom"],
  "left-start": ["right-start", "top-start", "bottom-start"],
  "left-end": ["right-end", "top-end", "bottom-end"],
  right: ["left", "top", "bottom"],
  "right-start": ["left-start", "top-start", "bottom-start"],
  "right-end": ["left-end", "top-end", "bottom-end"],
};

export const DEFAULT_ARROW:ArrowProps = {
  className: `fill-white 
  [&>path:first-of-type]:stroke-slate-300 
  [&>path:last-of-type]:fill-white
  dark:fill-slate:800
  dark:[&>path:last-of-type]:slate:800`,
  tipRadius: 2,
  strokeWidth: 0.25,
  style: { transform: "translateY(-1px)" },
  height: DEFAULT_POPPER_ARROW_HEIGHT,
  width: DEFAULT_POPPER_ARROW_WIDTH
};
