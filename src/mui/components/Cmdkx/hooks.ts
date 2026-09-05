import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Children, ReactNode } from "react";
import { JsonStructure } from "./types";


function getLabelFromChildren(children: ReactNode) {
  let label = "";

  Children.map(children, (child) => {
    if (typeof child === "string") {
      label += child;
    }
  });

  return label;
}


export function useOpenCmdk(
  setOpen: (open:boolean) => void,
  enable: boolean = true
) {
  useEffect(() => {
    if (enable){
      function handleKeyDown(e: KeyboardEvent) {
        if (
          (navigator?.platform?.toLowerCase().includes("mac")
            ? e.metaKey
            : e.ctrlKey) &&
          e.key === "k"
        ) {
          e.preventDefault();
          e.stopPropagation();
          
          setOpen(true);
        }
      }

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [setOpen]);
}
