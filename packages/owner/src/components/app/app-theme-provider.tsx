import React from "react";
import { Link as LinkComponent } from "~/components/app/link";
import { PaletteModeContext, useLocalization } from "~/context";
import { useLocalStorage } from "~/hooks/use-local-storage";
import {
  CoreThemeProvider,
  createTheme,
  GlobalStyles,
  ListContextProvider,
  useMediaQuery,
  type Theme,
} from "~/ui";
import { APP_THEME_MODE } from "~/utils/constant";
import type { ThemeMode } from "~/utils/types";

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
const _EMPTY = {};
/**
 * Compatibility layer for classic v5 themes. It will handle state management for the theme switcher.
 * In the v6 theme, this state management is handled by `useColorScheme`. But this hook will crash if
 * not run under context with a css vars theme.
 */
function AppThemeProvider(props: AppThemeProviderProps) {
  const { children, theme = createDefaultTheme(), window: appWindow } = props;

  const isDualTheme = "light" in theme || "dark" in theme;

  const preferredMode = usePreferredMode(appWindow);
  const [userMode, setUserMode] = useLocalStorage<ThemeMode>(
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

  const { direction } = useLocalization();

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
                hover:
                  "bg-header-med-hover hover:text-item hover:text-opacity-90",
                disabled: "",
                className: "px-3 py-3",
              },
              ul: false,
              global: true,
            }}
          >
            {children}
          </ListContextProvider>
        </>
      </PaletteModeContext.Provider>
    </CoreThemeProvider>
  );
}

export { AppThemeProvider };
