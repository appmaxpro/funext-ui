"use client"
// components
export * from "./theme";
export * from "./styles";
export * from "./theme/tw/props";
export * from "./components"

export * from "./hooks";
export * from "./utils";

//lib
export * from "./lib/isRecord"
export * from "./lib/createGlobalScopedContext"
export * from "./lib/portal"
export * from "./lib/layer"
export * from "./lib/presence"
export * from "./lib/click-away-listener"
export * from "./lib/scrollable"

export * from "./lib/transitions"
export * from './svg-icon'


// context
export {
  TailwindThemeContext as MaterialTailwindTheme,
  TailwindThemeProvider,
  useTailwindTheme,
} from "./theme";

import { propTypesColors } from "./types";

let muiValidColors:Array<string> = [...propTypesColors];
for (let c of [
  "success",
  "danger",
  "error",
  "warning",
  "info",
  "transparent",
  "default",
  "white",
  "dark",
  "light",
]) {
  if (!muiValidColors.includes(c)) {
    muiValidColors.push(c);
  }
}

export const muiDefaultColors = Object.freeze(muiValidColors);

export * from './App';
//export * from './mui/utils';
