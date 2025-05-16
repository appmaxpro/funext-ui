'use client';
import * as React from 'react';
import { useTheme } from '@funext/ui';
import IconButton from '@funext/ui/IconButton';
import Tooltip from '@funext/ui/Tooltip';
import DarkModeIcon from '@funext/icons/DarkMode';
import LightModeIcon from '@funext/icons/LightMode';
//import useSsr from '@toolpad/utils/hooks/useSsr';
import { PaletteModeContext } from '~/context';

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [ThemeSwitcher API](https://mui.com/toolpad/core/api/theme-switcher)
 */
function ThemeSwitcher() {
  const isSsr = false;//useSsr();
  const theme = useTheme();

  const { themeMode, setThemeMode, isDualTheme } = React.useContext(PaletteModeContext);
  
  const isDark = theme.colorSchemes.dark

  const toggleMode = React.useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  return isDualTheme ? (
    <Tooltip
      title={isSsr ? 'Switch mode' : `${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
      enterDelay={1000}
    >
      <div>
        <IconButton
          aria-label={
            isSsr
              ? 'Switch theme mode'
              : `Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`
          }
          onClick={toggleMode}
          sx={{
            color: (theme.vars ?? theme).palette.primary.dark,
          }}
        >
          {theme.getColorSchemeSelector ? (
            <React.Fragment>
              <DarkModeIcon
                sx={{
                  display: 'inline',
                  [theme.getColorSchemeSelector('dark')]: {
                    display: 'none',
                  },
                }}
              />
              <LightModeIcon
                sx={{
                  display: 'none',
                  [theme.getColorSchemeSelector('dark')]: {
                    display: 'inline',
                  },
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              {isSsr || themeMode !== 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
            </React.Fragment>
          )}
        </IconButton>
      </div>
    </Tooltip>
  ) : null;
}

export { ThemeSwitcher };