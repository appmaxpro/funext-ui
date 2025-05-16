import React from "react";
import type { ReactNode } from "react";
import { AnimationProps } from "../../types/generic";
export interface AccordionContextType {
  open: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  setOpen: (open: boolean) => void;
}

export const AccordionContext = React.createContext<AccordionContextType | null>(null);
AccordionContext.displayName = "Mux.AccordionContext";

export function useAccordion() {
  const context = React.useContext(AccordionContext);

  if (!context) {
    throw new Error(
      "useAccordion() must be used within an Accordion. It happens when you use AccordionHeader or AccordionBody components outside the Accordion component.",
    );
  }

  return context;
}

export interface AccordionContextProviderProps {
  value: AccordionContextType;
  children: ReactNode;
}

export const AccordionContextProvider = ({ value, children }: AccordionContextProviderProps) => {
  return <AccordionContext.Provider value={value}>{children}</AccordionContext.Provider>;
};

AccordionContextProvider.displayName = "Mux.AccordionContextProvider";
