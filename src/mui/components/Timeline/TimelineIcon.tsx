import React from "react";

// @floading-ui
import { useMergeRefs } from "@floating-ui/react";

// utils
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

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
    const variantClasses = objectsToString(
      variants[findMatch(valid.variants, variant, "filled")][
        findMatch(valid.colors, color, "gray")
      ],
    );
    const classes = twMerge(objectsToString(base), variantClasses, className);

    // 4. return
    return (
      <span ref={mergedRef} {...rest} className={classes}>
        {children}
      </span>
    );
  },
);
TimelineIcon.displayName = "Mux.TimelineIcon";

export default TimelineIcon;
