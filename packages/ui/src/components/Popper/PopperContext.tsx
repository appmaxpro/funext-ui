import React from "react";

// types
import { MuxFloatingProvider } from "../Context";
import type { PopperContextValue } from "./types";

export interface PopperContextProviderProps {
  value: PopperContextValue;
  children: React.ReactNode;
}

export const PopperContext = React.createContext<PopperContextValue | null>(null);
PopperContext.displayName = "Mux.PopperContext";

export function usePopper() {
  const context = React.useContext(PopperContext);

  if (!context) {
    throw new Error(
      "usePopper() must be used within a Popper. It happens when you use PopperHandler or PopperContent components outside the Popper component.",
    );
  }

  return context;
}

export const PopperContextProvider = ({
  value,
  children,
}: PopperContextProviderProps) => {
  return (
    <PopperContext.Provider value={value}>
      <MuxFloatingProvider context={value.context} type="popover">
        {children}
      </MuxFloatingProvider>
    </PopperContext.Provider>
  );
};


PopperContextProvider.displayName = "Mux.PopperContextProvider";
