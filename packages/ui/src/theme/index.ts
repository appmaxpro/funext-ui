export * from './createTheme';
export { default as createTheme } from './createTheme';
export { default as defaultTheme } from './defaultTheme';
export { default as memoTheme } from './memoTheme';
export * from './theme';
export * from './ThemeProvider';
export { default as ThemeProvider } from './ThemeProvider';
export { default as useRtl } from './useRtl';
import { SystemProps } from '@mui/system';
import { Theme as MuxTheme } from './theme';

export { default as THEME_ID } from './identifier';
export * from './TailwindThemeContext';

export type ExSxConfig = {

}

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface Theme extends MuxTheme {}
}


declare module '@mui/system' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface MUIStyledCommonProps{
    ownerState?: any;
  }
  interface BreakpointOverrides {
    xxl: true;
  }
  export interface OverwriteCSSProperties{
    radius?: SystemProps<MuxTheme>;

  }
}
