export * from './theme';
export * from './TailwindThemeProvider';
export * from './createTheme';
export {default as createTheme} from './createTheme';
export {default as memoTheme} from './memoTheme';
export { default as defaultTheme} from './defaultTheme';
export * from './ThemeProvider';
export { default as ThemeProvider} from './ThemeProvider';
export { default as useRtl} from './useRtl';
import { StyledComponent as SStyledComponent, StyledOptions } from '@emotion/styled';

import {Theme as MuxTheme} from './theme';

export  {default as THEME_ID} from './identifier';

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
}
