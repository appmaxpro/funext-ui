'use client';
import * as React from 'react';
import { 
  GlobalStyles as SystemGlobalStyles,
  GlobalStylesProps as StyledGlobalStylesProps
} from '@mui/system';

import { defaultTheme, Theme, THEME_ID } from '../../theme';


export interface GlobalStylesProps {
  /**
   * The styles you want to apply globally.
   */
  styles: StyledGlobalStylesProps<Theme>['styles'];
}

export function GlobalStyles(props:GlobalStylesProps) {
  return <SystemGlobalStyles {...props} defaultTheme={defaultTheme} themeId={THEME_ID} />;
}

export default GlobalStyles;