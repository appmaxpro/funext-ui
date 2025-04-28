"use client"
import { ClassNamesContent } from "@emotion/react";
import type {
  FloatingContext,
  UseFloatingReturn,
  Placement,
  ReferenceType,
  Strategy,
} from "@floating-ui/react";
import React, { useEffect, useMemo } from "react";
import { createGlobalScopedContext } from "../lib/createGlobalScopedContext";


export interface MuxFloating {
  context: FloatingContext<ReferenceType> | UseFloatingReturn<ReferenceType>;
  type: string;
}

const MuxFloatingContext = createGlobalScopedContext<MuxFloating|null>
('@funext/ui/context/floating', null)

export function MuxFloatingProvider({
  context,
  type,
  children
}: {
  children: React.ReactNode;
} & MuxFloating) {
  
  return <MuxFloatingContext.Provider value={{context, type}}>
    {children}
  </MuxFloatingContext.Provider>
}

export const useFloatingContext = ()=> React.useContext(MuxFloatingContext);

export const StyledContext = React.createContext<ClassNamesContent['css']>(()=> '');
export const useStyled = ()=> React.useContext(StyledContext);

const InViewContext = createGlobalScopedContext<{visible: boolean; hasVisible: boolean}>(
  '@funext/ui/context/in-view',
  {
  visible: false,
  hasVisible: false
});

export const InViewProvider = ({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) => {
  const wasVisible = React.useRef(visible);
  useEffect(()=> {
    if (visible && !wasVisible.current) {
      wasVisible.current = true;
    }
  }, [visible]);

  const value = useMemo(()=> ({visible, hasVisible: visible || wasVisible.current}), [visible, wasVisible.current]);

  return (
    <InViewContext.Provider value={value}>
      {children}
    </InViewContext.Provider>
  );
};
export const InViewConsumer = InViewContext.Consumer;

export const useInViewContext = () => React.useContext(InViewContext);