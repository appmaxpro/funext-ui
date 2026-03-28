import React from "react";
import type { WidgetBlockProps } from "../types";
import { WidgetBlockContext } from "~/context";


export function WidgetBlockProvider({block, children}: WidgetBlockProps) {
  const current = React.useContext(WidgetBlockContext)
  
  if(current !== block && block) {
    return <WidgetBlockContext.Provider value={block}>
       {children}
    </WidgetBlockContext.Provider>
  }
  return <>{children}</>
}

function WidgetBlockState({block, children}: WidgetBlockProps) {
  
}
