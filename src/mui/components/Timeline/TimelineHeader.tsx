import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import {
  className,
  children
} from "../../types/components/timeline";

export interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: className;
  children?: children;
}

export const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, children, ...rest }, ref) => {
    // 1. init
    const { timelineHeader } = useTailwindTheme();
    const { styles } = timelineHeader;
    const { base } = styles;

    // 3. set styles
    const classes = twMerge(objectsToString(base), className);

    // 4. return
    return (
      <div {...rest} ref={ref} className={classes}>
        {children}
      </div>
    );
  },
);


TimelineHeader.displayName = "Mux.TimelineHeader";

export default TimelineHeader;
