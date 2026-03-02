import {
  Component as OwlComponent,
  App,
  useRef,
  onMounted,
  onWillUnmount,
} from "@odoo/owl";
import * as React from "react";

export const OwlAppContext = React.createContext<App | null>(null);

OwlAppContext.displayName = "OwlAppContext";

export function RootOwlAppContextProvider({
  owlApp,
  children,
}: {
  owlApp: App<any>;
  children: React.ReactNode;
}) {
  if (!owlApp) throw new Error("No owlApp passed to RootOwlAppContextProvider");

  return (
    <OwlAppContext.Provider value={owlApp}>{children}</OwlAppContext.Provider>
  );
}
