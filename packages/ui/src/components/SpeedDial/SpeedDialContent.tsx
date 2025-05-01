"use client";
import React, { useEffect } from "react";

// @floating-ui
import { 
  useMergeRefs ,
  useFloatingParentNodeId
} from "@floating-ui/react";

// context
import { useSpeedDial } from "./index";
import { useTailwindTheme } from "../../theme";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";
import { styled, StyledComponent, SxComponentProps } from "../../styles";
import { AnimatedPresence } from "../../lib/presence/presence";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { slideFadeStyleStyle } from "../internal/animation";

const SpeedDialContentRoot = styled('div', {
    shouldForwardProp: (propName) => propName !== 'animate'
})(slideFadeStyleStyle) as StyledComponent<SxComponentProps & {animate?: boolean}>

export interface SpeedDialContentProps extends SxComponentProps {
   
}

export const SpeedDialContent = React.forwardRef<HTMLDivElement, SpeedDialContentProps>(
  ({ children, className, ...rest}, ref) => {
    // 1. init
    const {
      speedDialContent: { styles },
    } = useTailwindTheme();
    const { x, y, refs, open, strategy, getFloatingProps, setOpenState, ...context } = useSpeedDial();
    const mergedRefs = useMergeRefs([ref, refs.setFloating]);

    // 2. set styles
    const classes = twMerge(objectsToString(styles), 'z-speed-dial', className);
     

    const childArray = React.Children.toArray(children);

    const prefersReducedMotion = usePrefersReducedMotion();
    const animate = prefersReducedMotion ? false : context.animate;


    const nodeId =  useFloatingParentNodeId();

    //const MotionDiv = motion.div;

    // 4. return
    return (
      <div
        {...rest}
        ref={mergedRefs}
        className={classes}
        key={`${nodeId}-${childArray.length}`}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        {...getFloatingProps()}
      >
        {React.Children.map(children as any, (child: React.ReactElement, index:number) => (
          <AnimatedPresence
            key={`${nodeId}-${index}`}
            present={open}
          >
            <SpeedDialContentRoot animate={animate}>
              {child}
            </SpeedDialContentRoot>
          </AnimatedPresence>
        ))}
      </div>
    );
  }
);


SpeedDialContent.displayName = "Mux.SpeedDialContent";

export default SpeedDialContent;
