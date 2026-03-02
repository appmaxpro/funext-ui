import React from "react";

export function useEventListener(eventTarget: EventTarget,
   eventName:string, 
   callback: (...args:any[])=> void,
   enabled: boolean = true) {
  React.useEffect(()=> {
    if(enabled === false) return;
    eventTarget.addEventListener(eventName, callback)
    return () => eventTarget.removeEventListener(eventName, callback)
  })
}