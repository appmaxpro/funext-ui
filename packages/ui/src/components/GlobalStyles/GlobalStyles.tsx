'use client';
import * as React from 'react';
import { 
  GlobalStyles as SystemGlobalStyles,
  GlobalStylesProps as StyledGlobalStylesProps
} from '@mui/system';
import { Global } from '@emotion/react';

import { defaultTheme as defTheme, Theme, THEME_ID } from '../../theme';

function isEmpty(obj:any) {
  return obj === undefined || obj === null || Object.keys(obj).length === 0;
}

export interface GlobalStylesProps {
  defaultTheme?: object;
  /**
   * The styles you want to apply globally.
   */
  styles: StyledGlobalStylesProps<Theme>['styles'];
}

export function GlobalStyles(props:GlobalStylesProps) {

  const { styles, defaultTheme = defTheme } = props;

  const globalStyles =
    typeof styles === 'function'
      ? (themeInput:any) => styles(isEmpty(themeInput) ? defaultTheme : themeInput)
      : styles;

  return <Global styles={globalStyles as any} />;

}

export default GlobalStyles;