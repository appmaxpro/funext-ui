'use client';
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
  AnimationProps,
} from "../../types/components/collapse";
import {styled, SxComponentProps} from "../../styles";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";


const CollapseRoot = styled('div', {
  name: "MuxCollapse",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root,
})('');

export interface CollapseProps extends SxComponentProps<'div'> {
  open: boolean;
  animate?: AnimationProps;
  horizontal?: boolean;
  keepMounted?: boolean;
  motionProps?: MotionProps;
}

interface NewAnimatePresenceProps
  extends Omit<AnimatePresenceProps, "children"> {
  children: React.ReactNode;
}

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (
    { open, animate, className, horizontal, keepMounted, motionProps, children, ...rest },
    ref,
  ) => {
    // 1. init
    const mobileNavRef = React.useRef(null);
    const { collapse } = useTailwindTheme();
    const { styles } = collapse;
    const { base } = styles;

    // 2. set default props
    animate = animate ?? {};
    className = className ?? "";

    const direction = horizontal ? "width" : "height";

    // 3. set styles
    const classes = twMerge(classnames(objectsToString(base)), className);

    // 4. set animations
    const mainAnimation = {
      unmount: {
        [direction]: "0px",
        //transform: `scale(${horizontal ? .8 : 1}, ${horizontal ? 1 : .8})`,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      },
      mount: {
        [direction]: "auto",
        //transform: 'scale(1, 1)',
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      },
    };

    const appliedAnimation = merge(mainAnimation, animate);
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> =
      AnimatePresence;

    // 5. set refs
    const mergedRef = useMergeRefs([ref, mobileNavRef]);
    const ownerState = {
      open,
      keepMounted
    }
    // 6. return
    return (
      <LazyMotion features={domAnimation}>
        <CollapseRoot 
            aria-expanded={open ? 'true' : 'false'} 
            ownerState={ownerState}
            className={classes}
            {...rest}
            ref={mergedRef}>
          <NewAnimatePresence initial={false}>
            {keepMounted || open ? (
              <m.div
                initial="unmount"
                exit="unmount"
                animate={open ? "mount" : "unmount"}
                variants={appliedAnimation}
                className="overflow-hidden"
                {...motionProps}
              >
                {children}
              </m.div>
            ) : null}
          </NewAnimatePresence>
        </CollapseRoot>
      </LazyMotion>
    );
  },
);

Collapse.displayName = "Mux.Collapse";

export default Collapse;
