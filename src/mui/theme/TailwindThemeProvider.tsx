import React, { createContext, useContext } from "react";
import merge from "deepmerge";
import tailwindTheme from "../components/index";
import {type TailwindTheme} from "../components/index";

import combineMerge from "../utils/combineMerge";

const TailwindThemeContext = createContext<TailwindTheme>(tailwindTheme);

TailwindThemeContext.displayName = "TailwindThemeContext";


function TailwindThemeProvider({ value = {}, children }:any) {
  const mergedValue = merge(tailwindTheme, value, { arrayMerge: combineMerge });

  return (
    <TailwindThemeContext.Provider value={mergedValue}>{children}</TailwindThemeContext.Provider>
  );
}


export function useTailwindTheme(): TailwindTheme {
  return useContext(TailwindThemeContext);
}

export { TailwindThemeContext, TailwindThemeProvider};
