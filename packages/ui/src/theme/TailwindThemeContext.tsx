import React, { createContext, useContext } from "react";
import {type TailwindTheme} from "../mui";


const TailwindThemeContext = createContext<TailwindTheme>({});

TailwindThemeContext.displayName = "TailwindThemeContext";

export function useTailwindTheme(): TailwindTheme {
  return useContext(TailwindThemeContext);
}

export { TailwindThemeContext};
