import * as React from 'react';
import { useTheme as useThemeSystem } from '@mui/system';
import {default as muxDefaultTheme} from './defaultTheme';
import THEME_ID from './identifier';
import { Theme } from './theme';


export function internal_useTheme(defaultTheme?:Theme|undefined):Theme {
  const theme = useThemeSystem(defaultTheme ?? muxDefaultTheme) as any;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useDebugValue(theme);
  }

  return theme[THEME_ID] || theme;
}

export default internal_useTheme;