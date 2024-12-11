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