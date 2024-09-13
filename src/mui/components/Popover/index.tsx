import React, { useRef } from "react";

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
  useId,
  useClick,
  arrow as fuiArrow
} from "@floating-ui/react";

// utils
import merge from "deepmerge";

// context
import { useTailwindTheme } from "../../theme";
import { PopoverContextProvider, usePopover } from "./PopoverContext";

// types
import type {
  open,
  handler,
  placement,
  offset,
  dismiss,
  animate,
  children,
  ArrowProps
} from "../../types/components/popover";

// popover components
import { PopoverHandler, PopoverHandlerProps } from "./PopoverHandler";
import { PopoverContent, PopoverContentProps } from "./PopoverContent";
import C from "@/core/common";
import { isElement } from "../../utils";

export interface PopoverProps {
  open?: open;
  handler?: handler;
  placement?: placement;
  offset?: offset;
  dismiss?: dismiss;
  animate?: animate;
  children: children;
  arrow?: ArrowProps | boolean;
  target?: React.MutableRefObject<HTMLElement|null> | HTMLElement | null;
}

const Popover = ({
  open,
  handler,
  placement,
  offset,
  dismiss,
  animate,
  arrow,
  children,
  target,
}: PopoverProps) => {
  // 1. init
  const { popover } = useTailwindTheme();
  const { defaultProps } = popover;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // 2. set default props
  open = open ?? internalOpen;
  handler = handler ?? setInternalOpen;
  placement = placement ?? defaultProps.placement;
  offset = offset ?? defaultProps.offset;
  dismiss = dismiss ?? defaultProps.dismiss;
  animate = animate ?? defaultProps.animate;
  
  let arrowProps  = typeof arrow !== 'boolean' ?  arrow : defaultProps.arrow;

  const showArrow = typeof arrow === 'boolean' ? arrow : !!arrowProps;
  
  if (showArrow === false) {
    arrowProps = undefined;
  } else if (showArrow) {
    arrowProps = merge(defaultProps.arrow ?? defaultProps.arrow, arrowProps ?? {});
  }

  // 4. set animation
  const animation = {
    unmount: {
      opacity: 0,
    },
    mount: {
      opacity: 1,
    },
  };
  const appliedAnimation = merge(animation, animate as any);
  
  const arrowRef = useRef(null);

  // 5. set @floating-ui
  const { x, y, strategy, refs, update, context } = useFloating({
    open,
    placement,
    onOpenChange: handler,
    elements: target ? {
      reference: isElement(target) ? target : target?.current
    } : undefined,
    middleware: [
      fuiOffset(offset), 
      flip(), 
      shift(), 
      arrowProps && fuiArrow({
        element: arrowRef,
        padding: arrowProps.padding ?? 5
      })
    ],
    
  });

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context),
    useDismiss(context, dismiss),
  ]);
  
  React.useEffect(() => {
    if (refs.reference.current && refs.floating.current && open) {
      return autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  }, [open, update, refs.reference, refs.floating]);

  const contextValue = React.useMemo(
    () => ({
      open,
      strategy,
      x,
      y,
      context,
      reference: refs.setReference,
      floating: refs.setFloating,
      getReferenceProps,
      getFloatingProps,
      appliedAnimation,
      labelId,
      descriptionId,
      arrowRef,
      arrow:arrowProps,
    }),
    [
      open,
      strategy,
      x,
      y,
      context,
      refs.setReference,
      refs.setFloating,
      getFloatingProps,
      getReferenceProps,
      appliedAnimation,
      labelId,
      descriptionId,
      arrowRef
    ],
  );

  React.useEffect(()=> {
    if (open && !initialized) {
      setInitialized(true);
    }
  }, [open]);

  const hasTarget = !!target;
  if (!initialized && hasTarget) {
     return null;
  }

  // 6. return
  return (
    <PopoverContextProvider value={contextValue}>
      {
        hasTarget || initialized
        ? children
        : React.Children.toArray(children)
          .filter(c => ( c as any).type !== PopoverContent)
      }
    </PopoverContextProvider>);
  
};


Popover.displayName = "Mux.Popover";

export type { PopoverHandlerProps, PopoverContentProps };
export { Popover, PopoverHandler, PopoverContent, usePopover };
export default Object.assign(Popover, { Handler: PopoverHandler, Content: PopoverContent });
