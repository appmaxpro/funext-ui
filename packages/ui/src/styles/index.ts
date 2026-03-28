import type { StyledComponent } from '@emotion/styled';
import type { SxProps, SystemProps } from '@mui/system';
import type {
  ComponentProps,
  ComponentType,
  ElementType,
  JSXElementConstructor,
  ReactNode
} from 'react';
import extendSxProp from '../theme/extendSxProp';
export { default as composeClasses } from '@mui/utils/composeClasses';

import type { Theme } from '../theme';
import twx from '../theme/tw/twx';
import { internal_useTheme as useTheme } from '../theme/useTheme';

export * from '../theme';
export * from './useDefaultProps'
export { getPath } from '@mui/system/style';
export { default as memoTheme } from '../theme/memoTheme';
export { alpha } from '../utils';
export * from './clsx';
export { default as generateUtilityClass } from './generateUtilityClass';
export { default as generateUtilityClasses } from './generateUtilityClasses';
export { default as getOverlayAlpha } from './getOverlayAlpha';
export * from './globalCss';
export { default as styled } from './styled';
export { default as useSlot } from './useSlot';


// eslint-disable-next-line @typescript-eslint/naming-convention

export function SxProp() {
  return extendSxProp;
}

export type SxThemeProps = SxProps<Theme>;
export type SystemThemeProps = SystemProps<Theme>;

export type SxComponentProps<T extends (keyof JSX.IntrinsicElements | JSXElementConstructor<any> | never) = any> 
      = ComponentProps<T> & {
  sx?: SxThemeProps;
  as?: ElementType | ComponentType | undefined;
  className?: string;
  children?: ReactNode
} ;

export declare type StyledComponentOwner<
  P extends any,
  O extends SystemProps<Theme>> =  StyledComponent<P  & {
    ownerState: O;
}>;

export type {
  Breakpoint,
  BreakpointOverrides,
  Breakpoints,
  BreakpointsOptions,
  CreateMUIStyled, CSSInterpolation,
  CSSObject, Direction, Interpolation
} from '@mui/system';

export {
  css, darken, decomposeColor, emphasize, getContrastRatio,
  getLuminance,
  // color manipulators
  hexToRgb, hslToRgb, keyframes, lighten, recomposeColor, rgbToHex, StyledEngineProvider
} from '@mui/system';


export type {
  StyledComponent,
  SxProps,
  Theme
};

export {
  extendSxProp,
  twx, useTheme
};

