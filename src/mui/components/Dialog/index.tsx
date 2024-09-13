import React from "react";

// @floating-ui
import {
  useFloating,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
  useId,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useMergeRefs,
} from "@floating-ui/react";

// framer-motion
import { AnimatePresence, m, domAnimation, LazyMotion } from "framer-motion";

// utils
import classnames from "classnames";
import merge from "deepmerge";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type { NewAnimatePresenceProps, DismissProps, AnimationProps } from "../../types/generic";
import type {
  open,
  handler,
  size,
  dismiss,
  animate,
  className,
  children,
} from "../../types/components/dialog";

// dialog components
import { DialogHeader, DialogHeaderProps } from "./DialogHeader";
import { DialogBody, DialogBodyProps } from "./DialogBody";
import { DialogFooter, DialogFooterProps } from "./DialogFooter";

import { styled, SxThemeProps, type SxComponentProps } from "../../styles";
import { isElement } from "../../utils";


const DialogRoot = styled(m.div, {
  name: 'Dialog',
  slot: 'Root'
})<SxComponentProps<any>>('');

export interface DialogProps extends SxComponentProps<"div"> {
  open: boolean;
  handler: handler;
  size?: size;
  dismiss?: DismissProps;
  animate?: AnimationProps;
  children: children;
  target?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ 
    open, 
    handler, 
    size, 
    dismiss, 
    animate, 
    className, 
    target,
    children, 
    ...rest 
  }, ref) => {
    // 1. init
    const { dialog } = useTailwindTheme();
    const {
      defaultProps,
      valid,
      styles: { base, sizes },
    } = dialog;

    // 2. set default props
    handler = handler ?? undefined;
    size = size ?? defaultProps.size;
    dismiss = dismiss ?? defaultProps.dismiss;
    animate = animate ?? defaultProps.animate;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const backdropClasses = classnames(objectsToString(base.backdrop));
    const dialogClasses = twMerge(
      classnames(
        objectsToString(base.container),
        objectsToString(sizes[findMatch(valid.sizes, size, "md")]),
      ),
      className,
    );

    // 4. set animation
    const animation = {
      unmount: {
        opacity: 0,
        y: -50,
        transition: {
          duration: 0.3,
        },
      },
      mount: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
        },
      },
    };
    const backdropAnimation = {
      unmount: {
        opacity: 0,
        transition: {
          delay: 0.2,
        },
      },
      mount: {
        opacity: 1,
      },
    };
    const appliedAnimation = merge(animation, animate as any);

    // 5. set @floating-ui
    const { refs, context } = useFloating({
      open,
      onOpenChange: handler,
      elements: target ? {
        reference: isElement(target) ? target : target?.current
      } : undefined,
    });

    const id = useId();
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useRole(context),
      useDismiss(context, dismiss),
    ]);

    const mergedRef = useMergeRefs([ref, refs.floating]);

    // 6. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

    // 7. return
    return (
      <LazyMotion features={domAnimation}>
        <FloatingPortal id="modal-portal">
          <NewAnimatePresence>
            {open && (
              <FloatingOverlay
                style={{
                  zIndex: 9999,
                }}
                lockScroll
              >
                <FloatingFocusManager context={context}>
                  <m.div
                    className={classnames(size === "xxl" ? "" : backdropClasses, 'z-modal')}
                    initial="unmount"
                    exit="unmount"
                    animate={open ? "mount" : "unmount"}
                    variants={backdropAnimation}
                    transition={{ duration: 0.2 }}
                  >
                    <DialogRoot
                      {...getFloatingProps({
                        ...(rest as any),
                        ref: mergedRef,
                        className: dialogClasses,
                        "aria-labelledby": labelId,
                        "aria-describedby": descriptionId,
                      })}
                      initial="unmount"
                      exit="unmount"
                      animate={open ? "mount" : "unmount"}
                      variants={appliedAnimation}
                    >
                      {children}
                    </DialogRoot>
                  </m.div>
                </FloatingFocusManager>
              </FloatingOverlay>
            )}
          </NewAnimatePresence>
        </FloatingPortal>
      </LazyMotion>
    );
  },
);


Dialog.displayName = "Mux.Dialog";

export type { DialogHeaderProps, DialogBodyProps, DialogFooterProps };
export { Dialog, DialogHeader, DialogBody, DialogFooter };
export default Object.assign(Dialog, {
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
});
