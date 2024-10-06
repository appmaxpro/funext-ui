import React, { useContext } from "react";

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
  FloatingNode
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

import { clsx, styled, SxThemeProps, type SxComponentProps } from "../../styles";
import { isElement } from "../../utils";
import Panel from "../Panel";


const DialogRoot = styled(m.div, {
  name: 'Dialog',
  slot: 'Root'
})<SxComponentProps<any>>('');

export interface DialogProps extends SxComponentProps<"div"> {
  open: boolean;
  handler?: handler;
  size?: size;
  dismiss?: DismissProps | false;
  animate?: AnimationProps;
  children: children;
  target?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  focusProps?: Omit<FloatingFocusManagerProps, 'context'>;
  backdropProps?: any;
  elevation?: number;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>((props, ref)=>{
    // 1. init
    const parentId = useFloatingParentNodeId();

    // 2. return
    if (parentId == null && false) {
      return (
        <FloatingTree>
          <DialogCore ref={ref as any} {...props}/>
        </FloatingTree>
      );
    }

    return (
      <DialogCore ref={ref as any} {...props}/>
    );

})

const DialogCore = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ 
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

    const isFullScreen = size === "xxl";
    // 3. set styles
    let backdropClasses = backdropProps
        ? twMerge(classnames(objectsToString(base.backdrop), backdropProps.className)) 
        : undefined;

    const sizeClass = objectsToString(sizes[findMatch(valid.sizes, size, "md")]);

    const dialogClasses = twMerge(
      classnames(
        objectsToString(base.dialog),
        sizeClass,
        defaultProps.className
      ),
      className,
    );

    const panelClasses = twMerge(
      classnames(
        objectsToString(base.container),
        isFullScreen && 'h-full rounded-none shadow-none'
      )
    );
    

    // 4. set animation
    const animation = {
      unmount: {
        opacity: 0,
        ...(!isFullScreen 
          ? {y: -50}
          : {y: '100%'}),
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


    let backdropAnimation = backdropProps && !isFullScreen 
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

    const appliedAnimation = merge(animation, animate as any);

    const tree = useFloatingTree();
    const parentId = useFloatingParentNodeId();
    const nodeId = useFloatingNodeId();

    const nested = parentId != null;

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
      dismiss 
        ? useClick(context, {
            enabled: !nested,
            ignoreMouse: nested
        }) 
      : undefined,
      useRole(context),
      dismiss 
        ? useDismiss(context, nested ? {...dismiss, bubbles: false} : dismiss) 
        : undefined,
    ].filter(Boolean));

    const mergedRef = useMergeRefs([ref, refs.floating]);

    // 6. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;
    //const backdropClassName = size === "xxl" ? "" : backdropClasses;
    const backdropClassName = backdropClasses;
    // 7. return
    return (
      <LazyMotion features={domAnimation}>
        <DialogContext.Provider value={{open, nodeId, handler}}>
          <FloatingDialogPortal 
            id="modal-portal" 
            nested={nested} 
            nodeId={nodeId} 
            open={open}>
            <NewAnimatePresence>
              {open && (
                <FloatingOverlay 
                  className="z-modal h-full w-full"
                  lockScroll
                >
                  <FloatingFocusManager {...focusProps} context={context} >
                    {(!backdropProps) ?
                      <DialogRoot
                          {...getFloatingProps({
                            ...(rest as any),
                            className: dialogClasses,
                            ref: mergedRef,
                            "aria-labelledby": labelId,
                            "aria-describedby": descriptionId,
                          })}
                          initial="unmount"
                          exit="unmount"
                          animate={open ? "mount" : "unmount"}
                          variants={appliedAnimation}
                          style={{
                            ...rest.style
                          }}
                          sx={rest.sx}
                        >
                          <Panel 
                            className={panelClasses} 
                            elevation={elevation}>
                            {children}
                          </Panel>
                          
                        </DialogRoot>
                      :
                      <m.div
                        initial="unmount"
                        exit="unmount"
                        animate={open ? "mount" : "unmount"}
                        variants={backdropAnimation}
                        transition={{ duration: 0.2 }}
                        {...backdropProps}
                        className={twMerge(clsx(backdropClassName, 'z-modal', backdropProps?.className))}
                      >
                        <DialogRoot
                          {...getFloatingProps({
                            ...(rest as any),
                            className: dialogClasses,
                            ref: mergedRef,
                            "aria-labelledby": labelId,
                            "aria-describedby": descriptionId,
                          })}
                          initial="unmount"
                          exit="unmount"
                          animate={open ? "mount" : "unmount"}
                          variants={appliedAnimation}
                        >
                          <Panel 
                            className={panelClasses} 
                            elevation={elevation}>
                            {children}
                          </Panel>
                        </DialogRoot>
                    </m.div>
                    }
                  </FloatingFocusManager>
                </FloatingOverlay>
              )}
            </NewAnimatePresence>
          </FloatingDialogPortal>
        </DialogContext.Provider>
      </LazyMotion>
    );
  },
);


const FloatingDialogPortal = ({nested, nodeId, children, id}:FloatingPortalProps 
  & {nested:boolean, nodeId: string, open:boolean}) => {
    if (nested) {
      return children;
    }
    
    return <FloatingPortal id={id}>
        {children}
    </FloatingPortal>
}

Dialog.displayName = "Mux.Dialog";

type DialogContextValue = {
  open: boolean;
  nodeId: string;
  handler?: handler;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);
DialogContext.displayName = "Mux.DialogContext";

export const useDialogContext = ()=> useContext(DialogContext);

export type { DialogHeaderProps, DialogBodyProps, DialogFooterProps };
export { Dialog, DialogHeader, DialogBody, DialogFooter };
export default Object.assign(Dialog, {
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Tree: FloatingTree
});
