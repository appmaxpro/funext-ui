import * as React from 'react';
import type{
  ComponentProps, 
  JSXElementConstructor, 
  ElementType, 
  ComponentType,
  ReactNode
} from 'react';
import extendSxProp from '../theme/extendSxProp';
import type { Interpolation, SxProps, SystemProps } from '@mui/system';
export {default as composeClasses} from '@mui/utils/composeClasses';
import type { StyledComponent } from '@emotion/styled';

import type { Theme } from '../theme';
import {internal_useTheme as useTheme} from '../theme/useTheme';
import twx  from '../theme/tw/twx';

export * from '../theme';

export * from './clsx';
export {default as styled } from './styled';
export {default as getOverlayAlpha} from './getOverlayAlpha';
export {default as useSlot} from './useSlot';
export {default as memoTheme} from '../theme/memoTheme';
export {default as generateUtilityClasses} from './generateUtilityClasses';
export {default as generateUtilityClass} from './generateUtilityClass';
export { getPath } from '@mui/system/style';
export { alpha } from '../utils';
export * from './globalCss';


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

export type{
  Direction,
  Breakpoint,
  BreakpointOverrides,
  Breakpoints,
  BreakpointsOptions,
  CreateMUIStyled,
  Interpolation,
  CSSInterpolation,
  CSSObject,
} from '@mui/system';

export {
  css,
  keyframes,
  // color manipulators
  hexToRgb,
  rgbToHex,
  hslToRgb,
  decomposeColor,
  recomposeColor,
  getContrastRatio,
  getLuminance,
  emphasize,
  darken,
  lighten,
  StyledEngineProvider,
} from '@mui/system';

export * from './DefaultPropsProvider';

export type {
  StyledComponent,
  SxProps,
  Theme
}

export { 
  useTheme, 
  extendSxProp, 
  twx
};

