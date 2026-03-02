import { createTheme, ThemeProvider, type Theme } from "@funext/ui/styles";
import { useMediaQuery } from "@funext/ui/hooks";
import { CoreThemeProvider } from "@funext/ui/mui";
import { Link as LinkComponent } from "~/components/app/link";
import { useLocalStorageState } from "~/hooks/use-local-storage-state";
import React from "react";
import { GlobalStyles } from "@funext/ui/GlobalStyles";
import type { ThemeMode } from "~/utils/types";
import { PaletteModeContext, useLocalization } from "~/context";
import { ListContextProvider } from "@funext/ui";
import { APP_THEME_MODE } from "~/utils/constant";

const COLOR_SCHEME_STORAGE_KEY = "owner-app-color-scheme";

function usePreferredMode(window?: Window) {
  const prefersDarkMode = useMediaQuery(
    "(prefers-color-scheme: dark)",
    window && {
      matchMedia: window.matchMedia,
    },
  );
  return prefersDarkMode ? "dark" : "light";
}

export type AppTheme = Theme | { light: Theme; dark: Theme };

function createDefaultTheme(): Theme {
  return createTheme({
    colorSchemes: { dark: true },
  });
}

interface AppThemeProviderProps {
  children: React.ReactNode;
  theme?: AppTheme;
  window?: Window;
}
const _EMPTY = {}
/**
 * Compatibility layer for classic v5 themes. It will handle state management for the theme switcher.
 * In the v6 theme, this state management is handled by `useColorScheme`. But this hook will crash if
 * not run under context with a css vars theme.
 */
function AppThemeProvider(props: AppThemeProviderProps) {
  const { children, theme = createDefaultTheme(), window: appWindow } = props;

  const isDualTheme = "light" in theme || "dark" in theme;

  const preferredMode = usePreferredMode(appWindow);
  const [userMode, setUserMode] = useLocalStorageState<ThemeMode>(
    APP_THEME_MODE,
    "system",
  );

  const themeMode =
    !userMode || userMode === "system" ? preferredMode : userMode;
  const dualAwareTheme = React.useMemo(
    () =>
      isDualTheme
        ? (theme[themeMode === "dark" ? "dark" : "light"] ??
          theme[themeMode === "dark" ? "light" : "dark"])
        : theme,
    [isDualTheme, themeMode, theme],
  );

  // The v5 shim, based on local state
  const themeModeContextValue = React.useMemo(
    () => ({
      themeMode,
      setThemeMode: setUserMode,
      isDualTheme: true,
    }),
    [isDualTheme, themeMode, setUserMode],
  );

  const {direction} = useLocalization()

  return (
    <CoreThemeProvider
      dir={direction}
      theme={themeMode}
      //options={options}
      options={{
        enableCssLayer: true,
        components: {
          MuxLink: {
            defaultProps: {
              component: LinkComponent,
            },
          },
          MuxButtonBase: {
            defaultProps: {
              LinkComponent: LinkComponent,
            },
          },
        },
      }}
    >
      <PaletteModeContext.Provider value={themeModeContextValue}>
        <>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <ListContextProvider 
        value={{
           item: {
            hover: "bg-header-med-hover hover:text-item hover:text-opacity-90",
            disabled: "",
            className: "px-3 py-3",
          },
          ul: false,
          global: true
        }}>

        
          {children}
        </ListContextProvider>
        </>
        
      </PaletteModeContext.Provider>
    </CoreThemeProvider>
  );
}


export {
  AppThemeProvider
}