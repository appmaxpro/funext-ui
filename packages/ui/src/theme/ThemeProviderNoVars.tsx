'use client';
import * as React from 'react';
import { ThemeProvider as SystemThemeProvider, DefaultTheme } from '@mui/system';
import THEME_ID from './identifier';

export interface ThemeProviderNoVarsProps<Theme = DefaultTheme> {
  children?: React.ReactNode;
  theme: Partial<Theme> | ((outerTheme: Theme) => Theme);
}

export default function ThemeProviderNoVars<Theme = DefaultTheme>(props: ThemeProviderNoVarsProps<Theme>): React.ReactElement<ThemeProviderNoVarsProps<Theme>> {

  //console.log("ThemeProviderNoVars: props:", props);
  const {theme, children} = props;
  const scopedTheme = THEME_ID in theme ? theme[THEME_ID] : undefined;
  return (
    <SystemThemeProvider
      themeId={scopedTheme ? THEME_ID : undefined}
      theme={scopedTheme || theme}
    >
      {children}
    </SystemThemeProvider>
  );
}