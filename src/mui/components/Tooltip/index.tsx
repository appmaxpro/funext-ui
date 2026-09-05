import React, { 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef,
} from "react";
import type{ ReactNode } from "react";
// @floating-ui
import {
  offset as fuiOffset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useRole,
  useDismiss,
  useClick,
  useHover,
  useFocus,
  FloatingPortal,
  useMergeRefs,
  arrow,
  FloatingArrow,
  safePolygon,
  UseHoverProps
} from "@floating-ui/react";

// framer-motion
import { AnimatePresence, m, LazyMotion, domAnimation } from "framer-motion";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import merge from "deepmerge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type { NewAnimatePresenceProps } from "../../types/generic";
import type {
  open,
  handler,
  content,
  interactive,
  placement,
  offset,
  dismiss,
  animate,
  className,
  children,
  ArrowProps
} from "../../types/components/popover";
import { SxComponentProps, styled } from "../../styles";
import { isElement } from "../../utils";

const TooltipContentRoot = styled('div', {
  name: 'TooltipContent',
  slot: 'Root'
})('') ;

export type TooltipProps = SxComponentProps<'div'> & {
  open?: open;
  handler?: handler;
  content?: string | React.FC | React.ReactNode;
  interactive?: interactive;
  placement?: placement;
  offset?: offset;
  dismiss?: dismiss;
  animate?: animate;
  arrow?: ArrowProps; 
  showArrow?:boolean;
  children: children;
  target?: React.MutableRefObject<HTMLElement> | HTMLElement | null;
  tooltipProps?: SxComponentProps<'div'>;
  allowOverContent?: boolean;
  hoverProps?: UseHoverProps;
}

const TooltipFc:React.FC<TooltipProps> = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      open,
      handler,
      content,
      interactive,
      placement,
      offset,
      dismiss,
      arrow: arrowProps,
      showArrow = true,
      hoverProps,
      animate,
      className,
      target,
      tooltipProps = {},
      allowOverContent,
      children,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { tooltip } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = tooltip;
    const [internalOpen, setInternalOpen] = React.useState(false);

    // 2. set default props
    open = open ?? internalOpen;
    handler = handler ?? setInternalOpen;
    interactive = interactive ?? defaultProps.interactive;
    placement = placement ?? defaultProps.placement;
    offset = offset ?? defaultProps.offset;
    dismiss = dismiss ?? defaultProps.dismiss;
    animate = animate ?? defaultProps.animate;
    arrowProps = showArrow ? (arrowProps ?? defaultProps.arrow) : undefined;

    const [initialized, setInitialized] = React.useState(false);

    const arrowRef = useRef(null);  
    // 5. set @floating-ui
    const { x, y, strategy, refs, update, context } = useFloating({
      open,
      onOpenChange: handler,
      elements: target ? {
        reference: isElement(target) ? target : target?.current
      } : undefined,
      middleware: [
        fuiOffset(offset),
         flip(), 
         shift(),
         arrowProps && arrow({
          element: arrowRef,
          padding: arrowProps.padding ?? 5
        })
      ],
      placement,
    });

    const isOpen = context.open;

    const { getReferenceProps, getFloatingProps } = useInteractions([
      useClick(context, {
        enabled: interactive,
      }),
      useFocus(context),
      useHover(context, hoverProps ?? (allowOverContent ? {
        handleClose: safePolygon(),
      } : undefined)),
      useRole(context, { role: "tooltip" }),
      useDismiss(context, dismiss),
    ]);

    React.useEffect(() => {
      if (refs.reference.current && refs.floating.current && isOpen) {
        return autoUpdate(refs.reference.current, refs.floating.current, update);
      }
    }, [isOpen, update, refs.reference, refs.floating]);


    React.useEffect(()=> {
      if (isOpen && !initialized) {
        setInitialized(true);
      }
    }, [isOpen]);


    const childMergedRef = useMergeRefs([ref, refs.setReference]);
    const mergedRef = useMergeRefs([ref, refs.setFloating]);
    const hasTarget = !!target;

    const refChildren = hasTarget 
      ? null
      : (
        typeof children === "string" ? 
          <span
            {...getReferenceProps({
              ...(rest as any),
              ref: childMergedRef,
            })}
          >
            {children}
          </span>
        : 
          React.cloneElement(children as any, {
            ...getReferenceProps({
              ...rest,
              ...(children as any)?.props,
              ref: childMergedRef,
            }),
          })
        );
    
    const contentRef = useRef(null);
    
    useEffect(()=> {
      contentRef.current = null;
    }, [content] )

    useEffect(()=> {
       if (!hasTarget && isOpen && !contentRef.current) {
        contentRef.current = (typeof content === 'function' 
          ? (content as Function)() 
          : content
        );
       } 
    }, [isOpen, content])

    if (!initialized) {
      return refChildren;
    }

    const actualChildren  = hasTarget ? children : contentRef.current;

    // 6. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;    
    
    className = twMerge(defaultProps.className || "", className);
    
    // 3. set styles
    const tooltipClasses = twMerge(classnames(objectsToString(base)), className);


    // 4. set animation
    const animation = {
      initial: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.05,
        },
      },
      unmount: {
        opacity: .5,
        scale: .9,
        transition: {
          duration: 0.15,
        },
      },
      mount: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.2,
        },
      },
    };
    const appliedAnimation = merge(animation, animate as any);

    const {as, sx, ...other} = hasTarget ?  (rest as any) : tooltipProps;

    // 7. return
    return (
      <>
        {refChildren}
        <LazyMotion features={domAnimation}>
          <NewAnimatePresence>
            {isOpen && <FloatingPortal id="mux-portal">
              <m.div
                    {...getFloatingProps({
                      ...other,
                      ref: mergedRef,
                      className: tooltipClasses,
                      style: {
                        position: strategy,
                        top: y ?? "",
                        left: x ?? "",
                      },
                    })}
                    initial="initial"
                    exit="unmount"
                    animate={open ? "mount" : ["unmount", "initial"]}
                    variants={appliedAnimation}
                  >
                    <TooltipContentRoot as={as} sx={sx}>
                      {actualChildren}
                    </TooltipContentRoot>
                    {arrowProps ? (
                      <FloatingArrow
                        {...arrowProps.props}
                        ref={arrowRef}
                        context={context}
                      />
                    ) : null}
                  </m.div>                          
            </FloatingPortal>
            }
          </NewAnimatePresence>
        </LazyMotion>
      </>
    );
  },
);


export const Tooltip = Object.assign(TooltipFc, {safePolygon: safePolygon})
Tooltip.displayName = "Mux.Tooltip";

export default Tooltip;
