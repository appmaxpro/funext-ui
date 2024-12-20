import { ClassNamesContent } from "@emotion/react";
import type {
  FloatingContext,
  UseFloatingReturn,
  Placement,
  ReferenceType,
  Strategy,
} from "@floating-ui/react";
import React from "react";


export interface MuxFloating {
  context: FloatingContext<ReferenceType> | UseFloatingReturn<ReferenceType>;
  type: string;
}

const MuxFloatingContext = React.createContext<MuxFloating|undefined>(undefined)

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

const InViewContext = React.createContext<boolean>(false);

export const InViewProvider = ({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) => {
  return (
    <InViewContext.Provider value={visible}>
      {children}
    </InViewContext.Provider>
  );
};

export const useInViewContext = () => React.useContext(InViewContext);