import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import values from "../../utils/values";

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

const TimelineConnectorRoot = styled("span", {
  name: "MuxTimelineConnector",
  slot: "Root",
})({})

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: className;
  children?: children;
}

export const TimelineConnector = React.forwardRef<HTMLSpanElement, TimelineConnectorProps>(
  ({ className, children, ...rest }, ref) => {
    // 1. init
    const { timelineConnector } = useTailwindTheme();
    const { styles } = timelineConnector;
    const { base } = styles;
    const [width] = useTimelineItem();

    // 3. set styles
    const lineClasses = values(base.line);
    const containerClasses = twMerge(values(base.container), className);

    // 4. return
    return (
      <TimelineConnectorRoot
        {...rest}
        ref={ref}
        className={containerClasses}
        style={{
          top: `${width}px`,
          width: `${width}px`,
          opacity: width ? 1 : 0,
          height: `calc(100% - ${width}px)`,
        }}
      >
        {children && React.isValidElement(children) ? (
          React.cloneElement(children as React.ReactElement, {
            className: twMerge(lineClasses, children.props?.className),
          })
        ) : (
          <span className={lineClasses} />
        )}
      </TimelineConnectorRoot>
    );
  },
);
TimelineConnector.displayName = "Mux.TimelineConnector";

export default TimelineConnector;
