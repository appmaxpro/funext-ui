import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { useTimelineItem } from "./TimelineItem";

// types
import {
  className,
  children
} from "../../types/components/timeline";


import {
  styled
} from "../../styles";

const TimelineBodyRoot = styled("div", {
  name: "MuxTimelineBody",
  slot: "Root",
})({
  display: 'flex',
  gap: 2
})

export interface TimelineBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: className;
  children?: children;
}

export const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineBodyProps>(
  ({ className, children, ...rest }, ref) => {
    // 1. init
    const { timelineBody } = useTailwindTheme();
    const { styles } = timelineBody;
    const { base } = styles;
    const [width] = useTimelineItem();

    // 3. set styles
    const classes = twMerge(objectsToString(base), className);

    // 4. return
    return (
      <TimelineBodyRoot {...rest} ref={ref} className={classes}>
        <span
          className="pointer-events-none invisible h-full flex-shrink-0"
          style={{
            width: `${width}px`,
          }}
        />
        <div>{children}</div>
      </TimelineBodyRoot>
    );
  },
);

TimelineHeader.displayName = "Mux.TimelineHeader";

export default TimelineHeader;
