import React, { createContext, useContext } from "react";
import merge from "deepmerge";
import tailwindTheme from "../components/index";
import {type TailwindTheme} from "../components/index";

import combineMerge from "../utils/combineMerge";

const TailwindThemeContext = createContext<TailwindTheme>(tailwindTheme);

TailwindThemeContext.displayName = "TailwindThemeContext";


export const tailwindThemeMerge =(tailwindTheme:TailwindTheme, value:any = {}) => 
      merge(tailwindTheme, value, { arrayMerge: combineMerge })

function TailwindThemeProvider({ value = {}, children }:any) {
  const mergedValue = React.useMemo(()=> merge(tailwindTheme, value, { arrayMerge: combineMerge }), [value]);

  return (
    <TailwindThemeContext.Provider value={mergedValue}>{children}</TailwindThemeContext.Provider>
  );
}

function TailwindThemeProviderNoMerge({ value = {}, children }:any) {
  return (
    <TailwindThemeContext.Provider value={value}>{children}</TailwindThemeContext.Provider>
  );
}


export function useTailwindTheme(): TailwindTheme {
  return useContext(TailwindThemeContext);
}

export { TailwindThemeContext, TailwindThemeProvider, TailwindThemeProviderNoMerge};
