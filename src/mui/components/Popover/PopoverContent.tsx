import React from "react";

// @floating-ui
import { FloatingPortal, FloatingFocusManager, useMergeRefs } from "@floating-ui/react";

// framer-motion
import { AnimatePresence, m, LazyMotion, domAnimation } from "framer-motion";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { usePopover } from "./PopoverContext";
import {FloatingArrow}  from "./FloatingArrow";
 
// types
import type { NewAnimatePresenceProps } from "../../types/generic";
import type { className, children } from "../../types/components/popover";

import {SxComponentProps, styled} from '../../styles'


const PopoverRoot = styled(m.div, {
  name: 'Popover',
  slot: 'Root'
})('');

const PopoverContentRoot = styled('div', {
  name: 'PopoverContent',
  slot: 'Root'
})('');



export interface PopoverContentProps extends SxComponentProps<'div'> {
  contentClassName?: string;
  children: children;
  header?: children;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, header, className, contentClassName, ...rest }, ref) => {
    // 1. init
    const { popover } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base, content },
    } = popover;

    const {
      open,
      strategy,
      x,
      y,
      context,
      floating,
      getFloatingProps,
      appliedAnimation,
      labelId,
      descriptionId,
      arrowRef,
      arrow
    } = usePopover();

    // 2. set default props
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const popoverClasses = twMerge(classnames(objectsToString(base)), className);
    const contentClasses = twMerge(classnames(objectsToString(content)));

    // 4. set refs
    const mergedRef = useMergeRefs([ref, floating]);

    // 5. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

    //console.log("FloatingArrow: placement:", context.placement)
    // 6. return
    return (
      <LazyMotion features={domAnimation}>
        <FloatingPortal id="popover-portal" >
          <NewAnimatePresence>
            {open && (
              <FloatingFocusManager context={context}>
                <PopoverRoot
                  {...getFloatingProps({
                    ...(rest as any),
                    ref: mergedRef,
                    style: {
                      position: strategy,
                      top: y ?? "",
                      left: x ?? "",
                    },
                    "aria-labelledby": labelId,
                    "aria-describedby": descriptionId,
                  })}
                  className={popoverClasses}
                  initial="unmount"
                  exit="unmount"
                  animate={open ? "mount" : "unmount"}
                  variants={appliedAnimation}
                >
                  {header}
                  <PopoverContentRoot className={contentClasses} >
                    {children}
                  </PopoverContentRoot>
                  {arrow ? (
                    <FloatingArrow
                      {...arrow.props}
                      ref={arrowRef as any}
                      context={context}
                    />
                  ) : null}
                </PopoverRoot>
              </FloatingFocusManager>
            )}
          </NewAnimatePresence>
        </FloatingPortal>
      </LazyMotion>
    );
  },
);

PopoverContent.displayName = "Mux.PopoverContent";

export default PopoverContent;
