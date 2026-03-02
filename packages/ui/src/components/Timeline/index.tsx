import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import values from "../../utils/values";

// context
import { useTailwindTheme } from "../../theme";

// types
import {
  className,
  children
} from "../../types/components/timeline";

// components
import TimelineItem from "./TimelineItem";
import TimelineIcon from "./TimelineIcon";
import TimelineBody from "./TimelineBody";
import TimelineHeader from "./TimelineHeader";
import TimelineConnector from "./TimelineConnector";

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: className;
  children?: children;
}

export const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ className, children, ...rest }, ref) => {
    // 1. init
    const { timeline } = useTailwindTheme();
    const { styles } = timeline;
    const { base } = styles;

    // 3. set styles
    const classes = twMerge(values(base), className);

    // 4. return
    return (
      <ul ref={ref} {...rest} className={classes}>
        {children}
      </ul>
    );
  },
);


Timeline.displayName = "Mux.Timeline";

export { TimelineItem, TimelineIcon, TimelineBody, TimelineHeader, TimelineConnector };
export default Object.assign(Timeline, {
  Item: TimelineItem,
  Icon: TimelineIcon,
  Header: TimelineHeader,
  Body: TimelineBody,
  Connector: TimelineConnector,
});
