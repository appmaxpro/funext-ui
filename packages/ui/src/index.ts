"use client"
// components
export * from "./theme";
export * from "./styles";
export * from "./props";
export * from "./components/Accordion";
export * from "./components/Alert";
export * from "./components/Avatar";
export * from "./components/Breadcrumbs";
export * from "./components/Button";
export * from "./components/Card";
export * from "./components/Checkbox";
export * from "./components/Chip";
export * from "./components/Dialog";
export * from "./components/IconButton";
export * from "./components/Input";
export * from "./components/Menu";
export * from "./components/Navbar";
export * from "./components/Popover";
export * from "./components/Progress";
export * from "./components/Radio";
export * from "./components/Select";
export * from "./components/Switch";
export * from "./components/Tabs";
export * from "./components/Tooltip";
export * from "./components/Text";
export * from "./components/Collapse";
export * from "./components/List";
export * from "./components/ButtonGroup";
export * from "./components/Carousel";
export * from "./components/Drawer";
export * from "./components/Badge";
export * from "./components/Rating";
export * from "./components/Slider";
export * from "./components/Spinner";
export * from "./components/Timeline";
export * from "./components/Stepper";
export * from "./components/SpeedDial";
export * from "./components/Popper";
export * from "./components/Panel";
export * from "./components/Divider";
export * from "./components/Link";
export * from "./components/Box";
export * from "./components/Stack";
export * from "./components/Grid";
export * from "./components/Select/AutoSelect";
export * from "./components/Focus";
export * from "./components/Snackbar";
export * from "./components/GlobalStyles";
export * from "./components/Screen";
export * from "./components/Context";
export * from "./components/SvgIcon";


export * from "./hooks";
export * from "./utils";
export * from "./icons/material-icon";

import Input from "./components/Input";
export { Input as TextField };
// context
export {
  TailwindThemeContext as MaterialTailwindTheme,
  TailwindThemeProvider,
  useTailwindTheme,
} from "./theme";

import { propTypesColors } from "./types/generic";

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

// theme
export * from "./components/index";


export * from './App';
//export * from './mui/utils';
