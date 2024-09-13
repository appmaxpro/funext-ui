"use client";
import React, { useEffect } from "react";

// framer-motion
import { AnimatePresence, m, motion, LazyMotion, domAnimation } from "framer-motion";

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

const MotionDiv = motion.div;

export interface SpeedDialContentProps extends React.ComponentProps<"div"> {}

export const SpeedDialContent = React.forwardRef<HTMLDivElement, SpeedDialContentProps>(
  ({ children, className, ...rest }, ref) => {
    // 1. init
    const {
      speedDialContent: { styles },
    } = useTailwindTheme();
    const { x, y, refs, open, strategy, getFloatingProps, animation, setOpenState } = useSpeedDial();
    const mergedRefs = useMergeRefs([ref, refs.setFloating]);

    // 2. set styles
    const classes = twMerge(objectsToString(styles), 'z-speed-dial', className);
     

    const childArray = React.Children.toArray(children);
    const [counter, setCounter] = React.useState(0);

    const onAnimationComplete = () => {
      setCounter(counter+1);
      if (counter+1 === childArray.length) {
        setOpenState(open);
      }
    }

    useEffect(()=> setCounter(0), [open]);

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
          <MotionDiv
            key={`${nodeId}-${index}`}
            initial="unmount"
            exit="unmount"
            animate={open ? "mount" : "unmount"}
            variants={animation}
            onAnimationComplete={onAnimationComplete}
          >
            {child}
          </MotionDiv>
        ))}
      </div>
    );
  },
);


SpeedDialContent.displayName = "Mux.SpeedDialContent";

export default SpeedDialContent;
