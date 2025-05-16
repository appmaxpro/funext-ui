"use client";
import React, { useEffect } from "react";

// @floating-ui
import { useMergeRefs, useFloatingParentNodeId } from "@floating-ui/react";

// context
import { useSpeedDial } from "./index";
import { useTailwindTheme } from "../../theme";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";
import { styled, StyledComponent, SxComponentProps } from "../../styles";
import { AnimatedProps, getAnimationOrName, shouldForwardProp } from "../internal/animation";

const SpeedDialContentRoot = styled("div", {
  shouldForwardProp,
})(getAnimationOrName('slideFadeIn')) as StyledComponent<
  SxComponentProps & { animate?: boolean }
>;

export interface SpeedDialContentProps extends SxComponentProps, AnimatedProps {

}

export const SpeedDialContent = React.forwardRef<
  HTMLDivElement,
  SpeedDialContentProps
>(({ children, className, ...rest }, ref) => {
  // 1. init
  const {
    speedDialContent: { styles },
  } = useTailwindTheme();
  const {
    x,
    y,
    refs,
    open,
    strategy,
    getFloatingProps,
    setOpenState,
    animate,
    ...context
  } = useSpeedDial();
  //const mergedRefs = useMergeRefs([ref, refs.setFloating]);

  // 2. set styles
  const classes = twMerge(objectsToString(styles), "z-speed-dial", className);

  const childArray = React.Children.toArray(children);

  const nodeId = useFloatingParentNodeId();

  //const MotionDiv = motion.div;

  // 4. return
  return (
    <div
      {...rest}
      ref={refs.setFloating}
      className={classes}
      key={`${nodeId}-${childArray.length}`}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
      }}
      {...getFloatingProps()}
    >
      <SpeedDialContentRoot
        data-state={open ? "open" : "close"}
        data-side="bottom"
        animate={animate}
        ref={ref}
      >
        {React.Children.map(
          children as any,
          (child: React.ReactElement, index: number) =>
            React.cloneElement(child, {
              "data-state": open ? "open" : "close",
              animate  
            }),
        )}
      </SpeedDialContentRoot>
    </div>
  );
});

SpeedDialContent.displayName = "Mux.SpeedDialContent";

export default SpeedDialContent;
