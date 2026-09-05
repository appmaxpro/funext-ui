// @ts-nocheck
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  Fragment
} from "react";
import {Theme} from '../../../mui/theme';
import {createPortal} from 'react-dom';
import { TailwindThemeProvider, useG } from "../../../mui";


import { ClassValue, cssx } from "../../clsx";

import { adoptStyleSheet } from "./sheet";
import { ResponsiveThemeOptions } from "./types";
import {themeZIndex, type ZIndex} from './mui';
//import {darkTheme, lightTheme} from './emotion';
//import GlobalStyles from '../global';

import stylesLtr from "../styles.module.scss";
import stylesRtl from "../styles.rtl.module.scss";
import MuiThemeProvider from "../../../mui/theme/MuiThemeProvider";
import { useMediaQuery } from "../../../mui/hooks";

import { globalCss } from "../../../mui/styles";

const InputGlobalStyles = globalCss({
  '@keyframes mux-auto-fill': { from: { display: 'block' } },
  '@keyframes mux-auto-fill-cancel': { from: { display: 'block' } },
});
/*
// XXX(epurkhiser): We create our own emotion cache object to disable the
// stylis prefixer plugin. This plugin does NOT use browserlist to determine
// what needs prefixed, just applies ALL prefixes.
//
// In 2022 prefixes are almost ubiquitously unnecessary
const cache = createCache({key: 'app', stylisPlugins: []});
// Compat disables :nth-child warning
cache.compat = true;
*/

const STYLES: Record<string, CSSModuleClasses> = {
  ltr: stylesLtr,
  rtl: stylesRtl,
};

export interface CoreThemeContextValue {
  dir?: string;
  theme?: "light" | "dark";
  options?: ResponsiveThemeOptions;
  muiTheme?: Theme;
  muiOptions?: Partial<ThemeOptions>;
}

export interface CoreThemeProviderProps extends Partial<CoreThemeContextValue> {
  children: React.ReactElement;
}

const ThemeContext = createContext<CoreThemeContextValue>({});



export function CoreThemeProvider({
  dir,
  theme,
  muiTheme,
  muiOptions,
  options = {},
  children,
}: CoreThemeProviderProps) {
  const curr = useContext(ThemeContext);

  const value = useMemo(() => {
    return { ...curr, dir, theme };
  }, [curr, dir, theme]);


  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("dir") !== dir && dir) {
        //root.removeAttribute("dir"); 
        root.setAttribute('dir', dir);
        return () => {
          root.removeAttribute("dir");
        };
    }
  }, [dir]);

  const classes = useStyles();

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-bs-theme")) return;
    if (theme) root.setAttribute("data-bs-theme", theme);
    return () => {
      root.removeAttribute("data-bs-theme");
    };
  }, [theme]);

  useEffect(() => adoptStyleSheet(options, classes), [classes, dir, options]);
  const isDark = theme === 'dark';
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');
  
  useEffect(() => {
    if (isSystemDark && !isDark) {
      /*
      for (let s = 0; s < document.styleSheets.length; s++) {
        const styleSheet = document.styleSheets.item(s);
        const cssRules = styleSheet?.cssRules || new CSSRuleList();

        for (let r = 0; r < cssRules.length; r++) {
          const cssRule = cssRules.item(r);
          if (!(cssRule instanceof CSSMediaRule)) {
            continue;
          }

          const ruleMediaText = cssRule.media.mediaText;
          if (ruleMediaText.match(/(prefers-color-scheme: dark)/)) {
            console.log("-----------------remove rule: ", cssRule);
            cssRule.media.deleteMedium(ruleMediaText);
            continue;
          }

          
          // Replace the prefers-color-scheme media query to apply the desired theme.
          // It refers to the system media query in order to keep the mechanic in sync by reversing it.
           
          const newRuleMediaText = ruleMediaText.replace(
            /(dark|light)/,
            'light'
          );

          cssRule.media.deleteMedium(ruleMediaText);
          cssRule.media.appendMedium(newRuleMediaText);
          
        }
      }
       */ 
    }
  }, [isDark, isSystemDark]);

  

  //const emotionTheme = theme === 'dark' ? darkTheme : lightTheme;
  return (
    <TailwindThemeProvider>
      <MuiThemeProvider theme={muiTheme} options={muiOptions} mode={theme} dir={dir === 'rtl' ? dir : undefined}>
        <ThemeContext.Provider value={value}>
          {createPortal(
            <Fragment>
              <meta name="color-scheme" content={theme} />
            </Fragment>,
            document.head
          )}
          {typeof InputGlobalStyles === 'function' && <InputGlobalStyles/>}
          {cloneElement(children, { dir: value.dir, "data-bs-theme": theme })}
          
        </ThemeContext.Provider>
      </MuiThemeProvider>
    </TailwindThemeProvider> 
  );
}

export function useCoreTheme() {
  return useContext(ThemeContext);
}

export function useStyles() {
  const theme = useCoreTheme();
  const dir = theme.dir;
  if (dir && dir in STYLES) {
    return STYLES[dir];
  }
  return STYLES.ltr;
}

export function useClassNames() {
  const styles = useStyles();
  return useCallback(
    (...args: ClassValue[]) => cssx(styles, ...args),
    [styles],
  );
}

export function useClasses(...args: ClassValue[]) {
  const styles = useStyles();
  const className = useMemo(() => {
    const res = cssx(styles, ...args);
    return res.trim().length ? res : undefined;
  }, [args, styles]);

  return className;
}

export const DEFAULT_MODE_STORAGE_KEY = 'mode';
export const DEFAULT_COLOR_SCHEME_STORAGE_KEY = 'color-scheme';
export const DEFAULT_ATTRIBUTE = 'data-color-scheme';

export interface InitColorSchemeScriptProps {
  /**
   * The mode to be used for the first visit
   * @default 'light'
   */
  defaultMode?: 'light' | 'dark' | 'system';
  /**
   * The default color scheme to be used on the light mode
   * @default 'light'
   */
  defaultLightColorScheme?: string;
  /**
   * The default color scheme to be used on the dark mode
   * * @default 'dark'
   */
  defaultDarkColorScheme?: string;
  /**
   * The node (provided as string) used to attach the color-scheme attribute
   * @default 'document.documentElement'
   */
  colorSchemeNode?: string;
  /**
   * localStorage key used to store `mode`
   * @default 'mode'
   */
  modeStorageKey?: string;
  /**
   * localStorage key used to store `colorScheme`
   * @default 'color-scheme'
   */
  colorSchemeStorageKey?: string;
  /**
   * DOM attribute for applying color scheme
   * @default 'data-color-scheme'
   */
  attribute?: string;
  /**
   * Nonce string to pass to the inline script for CSP headers
   */
  nonce?: string | undefined;
}

export function InitColorSchemeScript(options?: InitColorSchemeScriptProps) {
  const {
    defaultMode = 'light',
    defaultLightColorScheme = 'light',
    defaultDarkColorScheme = 'dark',
    modeStorageKey = DEFAULT_MODE_STORAGE_KEY,
    colorSchemeStorageKey = DEFAULT_COLOR_SCHEME_STORAGE_KEY,
    attribute = DEFAULT_ATTRIBUTE,
    colorSchemeNode = 'document.documentElement',
    nonce,
  } = options || {};
  return (
    <script
      key="mui-color-scheme-init"
      suppressHydrationWarning
      nonce={typeof window === 'undefined' ? nonce : ''}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `(function() {
try {
  var mode = localStorage.getItem('${modeStorageKey}') || '${defaultMode}';
  var colorScheme = '';
  if (mode === 'system') {
    // handle system mode
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql.matches) {
      colorScheme = localStorage.getItem('${colorSchemeStorageKey}-dark') || '${defaultDarkColorScheme}';
    } else {
      colorScheme = localStorage.getItem('${colorSchemeStorageKey}-light') || '${defaultLightColorScheme}';
    }
  }
  if (mode === 'light') {
    colorScheme = localStorage.getItem('${colorSchemeStorageKey}-light') || '${defaultLightColorScheme}';
  }
  if (mode === 'dark') {
    colorScheme = localStorage.getItem('${colorSchemeStorageKey}-dark') || '${defaultDarkColorScheme}';
  }
  if (colorScheme) {
    ${colorSchemeNode}.setAttribute('${attribute}', colorScheme);
  }
} catch(e){}})();`,
      }}
    />
  );
}