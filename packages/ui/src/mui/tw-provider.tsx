
import React from "react";
import { TailwindThemeContext } from "../theme/TailwindThemeContext";
import combineMerge from "../utils/combineMerge";
import tailwindTheme, { TailwindTheme} from "./tw";
import merge from "../utils/deepmerge";


export const tailwindThemeMerge =(tailwindTheme:TailwindTheme, value:any = {}) => 
      merge(tailwindTheme, value, { arrayMerge: combineMerge })

export function TailwindThemeProvider({ value = {}, children }:any) {
  const mergedValue = React.useMemo(()=> merge(tailwindTheme, value, { arrayMerge: combineMerge }), [value]);

  return (
    <TailwindThemeContext.Provider value={mergedValue}>{children}</TailwindThemeContext.Provider>
  );
}

export function TailwindThemeProviderNoMerge({ value = {}, children }:any) {
  return (
    <TailwindThemeContext.Provider value={value}>{children}</TailwindThemeContext.Provider>
  );
}