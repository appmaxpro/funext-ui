import React, { useMemo } from "react";

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
import { mapThemeColor } from "../../hooks";
import { Box } from "../Box";
import { SxComponentProps } from "src/mui/styles";

export interface BadgeProps extends SxComponentProps {
  color?: color;
  invisible?: invisible;
  withBorder?: withBorder;
  overlap?: overlap;
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
    color = mapThemeColor(color, defaultProps.color);
    invisible = invisible ?? defaultProps.invisible;
    withBorder = withBorder ?? defaultProps.withBorder;
    overlap = overlap ?? defaultProps.overlap;
    placement = placement ?? defaultProps.placement;

    const {
      badgeContainerClasses,
      badgeClasses
    } = useMemo(()=> {

      containerProps =
        merge(defaultProps.containerProps, containerProps as any || {});
        
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
        defaultProps.className || "",
        classnames(badgeInitialClasses, badgePlacementClasses, badgeColorClasses, {
          [badgeWithBorderClasses]: withBorder,
          [badgeWithContentClasses]: content,
        }),
        className,
      );
      const badgeContainerClasses = twMerge(
        classnames(objectsToString(base.container), containerProps?.className),
      );
      return {
        badgeContainerClasses,
        badgeClasses
      }
    }, [className, overlap, color, withBorder, placement])
    

    // 4. return
    return (
      <Box ref={containerRef} {...containerProps} className={badgeContainerClasses}>
        {children}
        {!invisible && (
          <Box as="span" {...rest} ref={ref} className={badgeClasses}>
            {content}
          </Box>
        )}
      </Box>
    );
  },
);


Badge.displayName = "Mux.Badge";

export default Badge;
