import React from "react";

// utils
import merge from "deepmerge";
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import {
  color,
  invisible,
  withBorder,
  overlap,
  className,
  content,
  children,
  placement,
  containerProps,
  containerRef
} from "../../types/components/badge";
import { useThemeColor } from "../../hooks";

export interface BadgeProps {
  color?: color;
  invisible?: invisible;
  withBorder?: withBorder;
  overlap?: overlap;
  className?: className;
  content?: content;
  children?: children;
  placement?: placement;
  containerProps?: containerProps;
  containerRef?: containerRef;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      color,
      invisible,
      withBorder,
      overlap,
      placement,
      className,
      content,
      children,
      containerProps,
      containerRef,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { badge } = useTailwindTheme();
    const { valid, defaultProps, styles } = badge;
    const { base, placements, colors } = styles;

    // 2. set default props
    color = useThemeColor(color, defaultProps.color);
    invisible = invisible ?? defaultProps.invisible;
    withBorder = withBorder ?? defaultProps.withBorder;
    overlap = overlap ?? defaultProps.overlap;
    placement = placement ?? defaultProps.placement;
    className = twMerge(defaultProps.className || "", className);
    containerProps =
      merge(containerProps as any, defaultProps.containerProps || {}) ?? defaultProps.containerProps;

    // 3. set styles
    const badgeInitialClasses = objectsToString(base.badge.initial);
    const badgeWithBorderClasses = objectsToString(base.badge.withBorder);
    const badgeWithContentClasses = objectsToString(base.badge.withContent);
    const badgeColorClasses = objectsToString(colors[findMatch(valid.colors, color, "red")]);
    const badgePlacementClasses = objectsToString(
      placements[findMatch(valid.placements, placement, "top-end")][
        findMatch(valid.overlaps, overlap, "square")
      ],
    );
    const badgeClasses = twMerge(
      classnames(badgeInitialClasses, badgePlacementClasses, badgeColorClasses, {
        [badgeWithBorderClasses]: withBorder,
        [badgeWithContentClasses]: content,
      }),
      className,
    );
    const badgeContainerClasses = twMerge(
      classnames(objectsToString(base.container), containerProps?.className),
    );

    // 4. return
    return (
      <div ref={containerRef} {...containerProps} className={badgeContainerClasses}>
        {children}
        {!invisible && (
          <span {...rest} ref={ref} className={badgeClasses}>
            {content}
          </span>
        )}
      </div>
    );
  },
);


Badge.displayName = "Mux.Badge";

export default Badge;
