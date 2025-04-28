import { color, variant, propTypesColor, propTypesVariant } from "../../../types/components/timeline";

export interface TimelineItemStyleTypes {
  defaultProps?: {
    color?: color;
    variant?: variant;
  };
  valid?: {
    colors?: string[];
    variants?: string[];
  };
  styles?: {
    base?: object;
  };
}

export const timelineItem: TimelineItemStyleTypes = {
  defaultProps: {
    color: "primary",
    variant: "filled",
  },
  valid: {
    colors: propTypesColor,
    variants: propTypesVariant,
  },
  styles: {
    base: {
      display: "flex",
      position: "relative",
      flexDirection: "flex-col",
      gap: "gap-2",
    },
  },
};

export default timelineItem;
