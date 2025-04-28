"use client";
import React from "react";

// @floating-ui
import {
  offset as fuiOffset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useFloatingNodeId,
  useInteractions,
  useDismiss,
  safePolygon,
  useHover,
  FloatingNode,
  UseFloatingReturn,
  UseInteractionsReturn
} from "@floating-ui/react";

import { AnimatePresence, m, LazyMotion, domAnimation } from "framer-motion";

// context
import { useTailwindTheme } from "../../theme";

// utils
import merge from "deepmerge";

// types
import {
  open,
  handler,
  placement,
  offset,
  dismiss,
  animate
} from "../../types/components/speedDial";
// types
import type { NewAnimatePresenceProps } from "../../types/generic";

// components
import SpeedDialHandler from "./SpeedDialHandler";
import SpeedDialContent from "./SpeedDialContent";
import SpeedDialAction from "./SpeedDialAction";
import { time } from "console";

export interface SpeedDialProps extends React.ComponentProps<"div"> {
  open?: open;
  handler?: handler;
  placement?: placement;
  offset?: offset;
  dismiss?: dismiss;
  animate?: animate;
}

interface SpeedDialContextProps {
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  animation?: animate;
  className?: string;
  open: boolean;
  x?: number;
  y?: number;
  refs: UseFloatingReturn['refs'];
  context: UseFloatingReturn['context'];
  strategy: UseFloatingReturn['strategy'];
  setOpenState: (state: boolean) => void;
}

// context
export const SpeedDialContext = React.createContext<SpeedDialContextProps | null>(null);

export function useSpeedDial() {
  const context = React.useContext(SpeedDialContext);

  if (!context) {
    throw new Error("useSpeedDial must be used within a <SpeedDial />.");
  }

  return context;
}

function SpeedDial({
  open,
  handler,
  placement,
  offset,
  dismiss,
  animate,
  children,
}: SpeedDialProps) {
  // 1. init
  const {
    speedDial: { defaultProps },
  } = useTailwindTheme();
  const [internalOpen, setInternalOpen] = React.useState(false);
  

  // 2. set default props
  open = open ?? internalOpen;

  const [openState, setOpenState] = React.useState(open);

  handler = handler ?? setInternalOpen;
  placement = placement ?? defaultProps.placement;
  offset = offset ?? defaultProps.offset;
  dismiss = dismiss ?? defaultProps.dismiss;
  animate = animate ?? defaultProps.animate;

  // 3. set animation
  const animation = {
    unmount: {
      opacity: 0,
      scale: .5,
      transition: { duration: 0.2},
    },
    mount: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2},
    },
  };
  const appliedAnimation = merge(animation, animate as any);

  // 4. set floating ui
  const nodeId = useFloatingNodeId();

  const { x, y, strategy, refs, context } = useFloating({
    open,
    nodeId,
    placement,
    onOpenChange: handler,
    whileElementsMounted: autoUpdate,
    middleware: [fuiOffset(offset), flip(), shift()],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      handleClose: safePolygon(),
    }),
    useDismiss(context, dismiss),
  ]);
  
  const contextValue = React.useMemo(
    () => ({
      x,
      y,
      strategy,
      refs,
      open,
      context,
      getReferenceProps,
      getFloatingProps,
      animation: appliedAnimation,
      setOpenState,
    }),
    [
      context, 
      getFloatingProps, 
      getReferenceProps, 
      refs, 
      strategy, 
      x, 
      y, 
      open, 
      appliedAnimation,
      setOpenState
    ],
  );

  // 3. create an instance of AnimatePresence because of the types issue with the children
  const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;
  const array = React.Children.toArray(children).flat();
  const content = array.filter((a:any) => a.type === SpeedDialContent);

  // 5. return
  return (
    <SpeedDialContext.Provider value={contextValue}>
      <div className="group">
        {array.filter((a:any) => a.type !== SpeedDialContent)}
        <FloatingNode id={nodeId}>
          <LazyMotion features={domAnimation}>
            <NewAnimatePresence>
              {open ? content : null}
            </NewAnimatePresence>
          </LazyMotion>
        </FloatingNode>
      </div>
    </SpeedDialContext.Provider>
  );
}


SpeedDial.displayName = "Mux.SpeedDial";

export { SpeedDial, SpeedDialHandler, SpeedDialContent, SpeedDialAction };
export default Object.assign(SpeedDial, {
  Handler: SpeedDialHandler,
  Content: SpeedDialContent,
  Action: SpeedDialAction,
});
