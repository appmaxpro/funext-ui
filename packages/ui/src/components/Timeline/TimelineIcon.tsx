import React from "react";

// @floading-ui
import { useMergeRefs } from "@floating-ui/react";

// utils
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import values from "../../utils/values";

// context
import { useTailwindTheme } from "../../theme";
import { useTimelineItem } from "./TimelineItem";

// types
import {
  className,
  children,
  color,
  variant
} from "../../types/components/timeline";

import {
  styled
} from "../../styles";

const TimelineIconRoot = styled("span", {
  name: "MuxTimelineIcon",
  slot: "Root",
})({})

export interface TimelineIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: className;
  children?: children;
  variant?: variant;
  color?: color;
}

export const TimelineIcon = React.forwardRef<HTMLSpanElement, TimelineIconProps>(
  ({ color, variant, className, children, ...rest }, ref) => {
    // 1. init
    const { timelineIcon } = useTailwindTheme();
    const { styles, valid } = timelineIcon;
    const { base, variants } = styles;
    const [, setWidth] = useTimelineItem();
    const innerRef = React.useRef<HTMLSpanElement>(null);
    const mergedRef = useMergeRefs([ref, innerRef]);

    React.useEffect(() => {
      const iconElement = innerRef.current;

      if (iconElement) {
        const { width } = iconElement.getBoundingClientRect();

        setWidth(width);

        return () => {
          setWidth(0);
        };
      }
    }, [setWidth, className, children]);

    // 3. set styles
    const variantClasses = values(
      variants[findMatch(valid.variants, variant, "ghost")][
        findMatch(valid.colors, color, "primary")
      ],
    );
    const classes = twMerge(values(base), variantClasses, className);

    // 4. return
    return (
      <TimelineIconRoot ref={mergedRef} {...rest} className={classes}>
        {children}
      </TimelineIconRoot>
    );
  },
);
TimelineIcon.displayName = "Mux.TimelineIcon";

export default TimelineIcon;
