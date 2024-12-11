import * as React from "react";
import { alpha } from "../utils";
import { type Theme } from "./theme";
import createTheme from "./createTheme";
import useTheme from "./useTheme";
import { default as MuxThemeProvider } from "./ThemeProvider";
import {
  CacheProvider,
  ThemeProvider as EmotionThemeProvider,
  ClassNames
} from "@emotion/react";
import createCache from "@emotion/cache";
import { PaletteMode } from "./createPalette";

import rtlPlugin from "stylis-plugin-rtl";
// @ts-ignore
import { prefixer } from "stylis";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeOptions } from "@mui/system";
import ClassNameGenerator from "@mui/utils/ClassNameGenerator";
import { StyledContext } from "../components/Context";

//import '../../global.css';

//import '../../global.css';

//import '../../index.css';

let currentNames = new Set();
let nameToName = new Map();

export interface CssBaselineProps {
  /**
   * You can wrap a node.
   */
  children?: React.ReactNode;
  /**
   * Enable `color-scheme` CSS property to use `theme.palette.mode`.
   * For more details, check out https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
   * For browser support, check out https://caniuse.com/?search=color-scheme
   * @default false
   */
  enableColorScheme?: boolean;
}

//ClassNameGenerator.configure((name) => name);

/*
ClassNameGenerator.configure((name) => {
  let ret = nameToName.get(name)
  if (!ret) {
    do{
      ret = `bX${Math.floor(Math.random() * 1000)}x`
    } while(currentNames.has(ret))
    currentNames.add(ret);
    nameToName.set(name, ret);
  }
  return ret;
})*/
// prepend: true moves MUI styles to the top of the <head> so they're loaded first.
// It allows developers to easily override MUI styles with other styling solutions, like CSS modules.

const cache = createCache({
  key: "mx",
  prepend: true,
  stylisPlugins: []
});

const rtlCache = createCache({
  key: "mxr",
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});

export default function MuiThemeProvider(props: {
  children: React.ReactNode;
  theme?: Theme;
  options?: Partial<ThemeOptions>;
  mode?: PaletteMode;
  dir?: "rtl" | undefined;
}) {
  const { dir } = props;
  const {
    children,
    options,
    mode = "light",
    theme = createTheme({ 
      direction: dir, 
      ...(options as any),
      palette: { mode: mode || "light", ...options?.palette},
    }),
  } = props;

  const [importedComponent, setImportedComponent] = React.useState(null);

  React.useEffect(() => {
    /*
    const importComponent = async () => {
      const Mdd = await import('../../global.css');
      const css = Mdd;
      console.log("global.css:", css)
      setImportedComponent(css);
    };

    importComponent();
    */
  }, []);

  const cssCache = dir === "rtl" ? rtlCache : cache;

  //console.log("MuiThemeProvider: background:", theme.palette.action)
  function log(...val:any[]){
    console.log(...val)
    return null;
  }

  return (
    <CacheProvider value={cssCache} >
      <EmotionThemeProvider theme={theme}>
        <MuxThemeProvider theme={theme}>
          {<HiddenEl />}
          {React.cloneElement(children as any)}
        </MuxThemeProvider>
      </EmotionThemeProvider>
    </CacheProvider>
  );
}

const HiddenEl = () => {
  const theme = useTheme();
  //console.log("ThemeContext.Consumer: props:", theme)
  return null;
};
