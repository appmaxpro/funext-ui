import React from "react";

// framer-motion components
import {
  AnimatePresence,
  AnimatePresenceProps,
  m,
  MotionProps,
  LazyMotion,
  domAnimation,
} from "framer-motion";

// @floating-ui
import { useMergeRefs } from "@floating-ui/react";

// utils
import merge from "deepmerge";
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import {
  open,
  animate,
  className,
  children,
} from "../../types/components/collapse";

export interface CollapseProps extends Omit<MotionProps, "animate"> {
  open: open;
  animate?: animate;
  className?: className;
  children: children;
  horizontal?:boolean;
}

interface NewAnimatePresenceProps extends Omit<AnimatePresenceProps, "children"> {
  children: React.ReactNode;
}

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ open, animate, className, horizontal, children, ...rest }, ref) => {
    // 1. init
    const mobileNavRef = React.useRef(null);
    const { collapse } = useTailwindTheme();
    const { styles } = collapse;
    const { base } = styles;

    // 2. set default props
    animate = animate ?? {};
    className = className ?? "";

    const direction = horizontal ? 'width' : 'height';

    // 3. set styles
    const classes = twMerge(classnames(objectsToString(base)), className);

    // 4. set animations
    const mainAnimation = {
      unmount: {
        [direction]: "0px",
        transition: { duration: 0.3, times: [0.4, 0, 0.2, 1] },
      },
      mount: {
        [direction]: "auto",
        transition: { duration: 0.3, times: [0.4, 0, 0.2, 1] },
      },
    };

    const appliedAnimation = merge(mainAnimation, animate);
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

    // 5. set refs
    const mergedRef = useMergeRefs([ref, mobileNavRef]);

    // 6. return
    return (
      <LazyMotion features={domAnimation}>
        <NewAnimatePresence>
          <m.div
            {...rest}
            ref={mergedRef}
            className={classes}
            initial="unmount"
            exit="unmount"
            animate={open ? "mount" : "unmount"}
            variants={appliedAnimation}
            
          >
            {children}
          </m.div>
        </NewAnimatePresence>
      </LazyMotion>
    );
  },
);

Collapse.displayName = "Mux.Collapse";


export default Collapse;
