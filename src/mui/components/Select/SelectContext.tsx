import React from "react";

// framer-motion
import { useIsomorphicLayoutEffect } from "framer-motion";

// types
import type { contextValue, children } from "../../types/components/select";

export type SelectContextType = contextValue;

export interface SelectContextProviderProps {
  value: contextValue;
  children: children;
}

export const SelectContext = React.createContext<SelectContextType | null>(null);
SelectContext.displayName = "Mux.SelectContext";

export function useSelect() {
  const context = React.useContext(SelectContext);

  if (context === null) {
    throw new Error(
      "useSelect() must be used within a Select. It happens when you use SelectOption component outside the Select component.",
    );
  }

  return context;
}


export const SelectContextProvider = ({ value, children }: SelectContextProviderProps) => {
  return <SelectContext.Provider value={value}>{children}</SelectContext.Provider>;
};

SelectContextProvider.displayName = "Mux.SelectContextProvider";
