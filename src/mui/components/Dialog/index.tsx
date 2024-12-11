import React, { useContext, useMemo } from "react";

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
  FloatingFocusManagerProps,
  FloatingTree,
  useFloatingParentNodeId,
  useFloatingNodeId,
  useFloatingTree,
  FloatingPortalProps,
  FloatingRootContext
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
import type {
  NewAnimatePresenceProps,
  DismissProps,
  AnimationProps,
} from "../../types/generic";
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

import {
  clsx,
  styled,
  SxThemeProps,
  type SxComponentProps,
} from "../../styles";
import { isElement } from "../../utils";
import Panel from "../Panel";
import { MuxFloatingProvider, useFloatingContext } from "../Context";

const DialogRoot = styled("div", {
  name: "MuxDialog",
  slot: "Root",
})<SxComponentProps<any>>("");

const DialogBackdrop = styled("div", {
  name: "MuxDialogBackdrop",
  slot: "Root",
})<SxComponentProps<any>>("");

export interface DialogProps extends SxComponentProps<"div"> {
  open: boolean;
  handler?: handler;
  size?: size;
  dismiss?: DismissProps | false;
  animate?: AnimationProps | false;
  children: children;
  target?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  focusProps?: Omit<FloatingFocusManagerProps, "context" | "children">;
  backdropProps?: any;
  elevation?: number;
}

const DialogFc = React.forwardRef<HTMLDivElement, DialogProps>((props, ref) => {
  let {
    open,
    handler,
    size,
    dismiss,
    animate,
    className,
    target,
    focusProps,
    backdropProps = {},
    elevation,
    children,
    ...rest
  } = props;

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

  const isFullScreen = size === "xxl";
  // 3. set styles
  let backdropClasses = backdropProps
    ? twMerge(
        classnames(objectsToString(base.backdrop)),
        "z-modal", 
        backdropProps.className
      )
    : undefined;

  const sizeClass = objectsToString(sizes[findMatch(valid.sizes, size, "md")]);

  const dialogClasses = twMerge(
    classnames(objectsToString(base.dialog), sizeClass, defaultProps.className),
    "z-modal",
    className,
  );

  const panelClasses = twMerge(
    classnames(
      objectsToString(base.container),
      isFullScreen && "h-full rounded-none shadow-none",
    ),
  );

  const animated = animate !== false ? animate ?? defaultProps.animate : null;

  // 4. set animation
  const animation = animated
    ? {
        unmount: {
          opacity: 0,
          ...(!isFullScreen ? { y: -50 } : { y: "110%" }),
          transition: {
            
            duration: isFullScreen ? 0.2 : 0.3,
          },
        },
        mount: {
          opacity: 1,
          y: 0,
          transition: {
            duration: isFullScreen ? 0.2 : 0.3,
          },
        },
      }
    : null;

  let backdropAnimation =
    animation && backdropProps /*&& !isFullScreen*/
      ? {
          unmount: {
            opacity: 0,
            transition: {
              delay: 0.2,
            },
          },
          mount: {
            opacity: 1,
          },
        }
      : undefined;

  const appliedAnimation = useMemo(()=> animation && merge(animation, animated as any), [!open])

  // 5. set @floating-ui
  const { refs, context } = useFloating({
    open,
    onOpenChange: handler,
    elements: target
      ? {
          reference: isElement(target) ? target : target?.current,
        }
      : undefined,
  });

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const { getFloatingProps } = useInteractions(
    [
      useRole(context),
      dismiss ? useDismiss(context, dismiss) : undefined,
    ].filter(Boolean),
  );

  const mergedRef = useMergeRefs([ref, refs.floating]);

  const renderContent:React.ReactNode = useMemo(() => (
    <DialogRoot
      {...rest}
      {...getFloatingProps({
        ...(rest as any),
        className: dialogClasses,
        ref: mergedRef,
        "aria-labelledby": labelId,
        "aria-describedby": descriptionId,
        style: rest.style,
      })}
      {...(appliedAnimation && {
        exit: "unmount",
        initial: "unmount",
        animate: open ? "mount" : "unmount",
        variants: appliedAnimation,
        as: m.div,
      })}
    >
      <Panel className={panelClasses} elevation={elevation}>
        {children}
      </Panel>
    </DialogRoot>
  ), [appliedAnimation, dialogClasses, panelClasses, elevation]);

  // 6. Create an instance of AnimatePresence because of the types issue with the children
  const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

  // 7. return
  return (
    <LazyMotion features={domAnimation}>
      <MuxFloatingProvider type="dialog" context={context}>
        <NewAnimatePresence presenceAffectsLayout={false} >
          {open && (
            <FloatingPortal id="mux-portal">
              <FloatingOverlay className="z-modal h-screen w-screen overflow-hidden" lockScroll>
                {backdropProps &&  (
                    <DialogBackdrop
                      {...(backdropAnimation && {
                        exit: "unmount",
                        initial: "unmount",
                        animate: open ? "mount" : "unmount",
                        variants: backdropAnimation,
                        transition: { duration: 0.2 },
                        as: m.div,
                      })}
                      className={backdropClasses}
                    />
                )}
                <div className="inset-0 flex items-center justify-center h-full w-full absolute overflow-hidden">
                  <FloatingFocusManager {...focusProps} context={context}>                  
                    {renderContent}
                  </FloatingFocusManager>
                </div>
              </FloatingOverlay>
            </FloatingPortal>
          )}
        </NewAnimatePresence>
      </MuxFloatingProvider>
    </LazyMotion>
  );
});

const FloatingDialogPortal = ({
  nested,
  nodeId,
  children,
  id,
  open,
}: FloatingPortalProps & {
  nested: boolean;
  nodeId: string;
  open: boolean;
}) => {
  if (nested) {
    return children;
  }

  return <FloatingPortal id={id}>{children}</FloatingPortal>;
};

DialogFc.displayName = "Mux.Dialog";

export const useDialogContext = useFloatingContext;

export type { DialogHeaderProps, DialogBodyProps, DialogFooterProps };

const Dialog = Object.assign(DialogFc, {
  Header: DialogHeader,
  Body: DialogBody,
  Content: DialogBody,
  Footer: DialogFooter,
  Tree: FloatingTree,
});

export { Dialog, DialogHeader, DialogBody, DialogFooter };
export default Dialog;
