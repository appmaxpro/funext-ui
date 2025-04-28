import * as React from "react";
import { type Theme } from "./theme";
import createTheme from "./createTheme";
import useTheme from "./useTheme";
import { default as MuxThemeProvider } from "./ThemeProvider";
import {
  CacheProvider,
  ThemeProvider as EmotionThemeProvider,
  ClassNames,
} from "@emotion/react";
import createCache, { EmotionCache } from "@emotion/cache";
import { PaletteMode } from "./createPalette";

import rtlPlugin from "stylis-plugin-rtl";
// @ts-ignore
import { prefixer } from "stylis";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeOptions } from "@mui/system";
//import ClassNameGenerator from "@mui/utils/ClassNameGenerator";
//import { StyledContext } from "../components/Context";

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
  stylisPlugins: [],
});

const rtlCache = createCache({
  key: "mxr",
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});

export interface NextOptions {
  useServerInsertedHTML?: (callback: () => void) => void;
  cache?: EmotionCache;
  options?: {
    enableCssLayer?: boolean;
    nonce?: string;
  };
}
export type MuxThemeOption = ThemeOptions;
export default function MuiThemeProvider(props: {
  children: React.ReactNode;
  theme?: Theme;
  options?: Partial<MuxThemeOption>;
  mode?: PaletteMode;
  dir?: "rtl" | undefined;
  nextOptions?: NextOptions;
}) {
  const { dir, children, nextOptions, options, mode } = props;

  const theme = React.useMemo(()=> {
    const {
      theme = createTheme({
        direction: dir,
        ...(options as any),
        palette: { mode: mode || "light", ...options?.palette },
      }),
    } = props;
    return theme
  }, [props.theme, options, mode, dir ])


  const [importedComponent, setImportedComponent] = React.useState(null);


  const cssCache = (nextOptions?.cache ?? dir === "rtl") ? rtlCache : cache;

  //console.log("MuiThemeProvider: background:", theme.palette.action)
  function log(...val: any[]) {
    console.log(...val);
    return null;
  }

  const emotionThemeProvider = (
    <EmotionThemeProvider theme={theme}>
      <MuxThemeProvider theme={theme}>
        {React.cloneElement(children as any)}
      </MuxThemeProvider>
    </EmotionThemeProvider>
  );
  if (nextOptions && !nextOptions.cache) {
    return (
      <NextCacheProvider
        cache={cssCache}
        useServerInsertedHTML={
          nextOptions.useServerInsertedHTML ?? ((fn) => fn())
        }
        options={nextOptions.options}
      >
        {emotionThemeProvider}
      </NextCacheProvider>
    );
  }

  return <CacheProvider value={cssCache}>{emotionThemeProvider}</CacheProvider>;
}

const HiddenEl = () => {
  const theme = useTheme();
  //console.log("ThemeContext.Consumer: props:", theme)
  return null;
};

function NextCacheProvider({
  cache,
  useServerInsertedHTML,
  children,
  options,
}: {
  cache: EmotionCache;
  useServerInsertedHTML: (callback: () => void) => void;
  children: React.ReactNode;
  options?: {
    enableCssLayer?: boolean;
    nonce?: string;
  };
}) {
  const [registry] = React.useState(() => {
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: { name: string; isGlobal: boolean }[] = [];
    // Override the insert method to support streaming SSR with flush().
    cache.insert = (...args) => {
      if (options?.enableCssLayer) {
        args[1].styles = `@layer mui {${args[1].styles}}`;
      }
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({
          name: serialized.name,
          isGlobal: !selector,
        });
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const inserted = registry.flush();
    if (inserted.length === 0) {
      return null;
    }
    let styles = "";
    let dataEmotionAttribute = registry.cache.key;

    const globals: {
      name: string;
      style: string;
    }[] = [];

    inserted.forEach(({ name, isGlobal }) => {
      const style = registry.cache.inserted[name];

      if (typeof style === "string") {
        if (isGlobal) {
          globals.push({ name, style });
        } else {
          styles += style;
          dataEmotionAttribute += ` ${name}`;
        }
      }
    });

    return (
      <React.Fragment>
        {globals.map(({ name, style }) => (
          <style
            nonce={options?.nonce}
            key={name}
            data-emotion={`${registry.cache.key}-global ${name}`}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
        {styles && (
          <style
            nonce={options?.nonce}
            data-emotion={dataEmotionAttribute}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </React.Fragment>
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
