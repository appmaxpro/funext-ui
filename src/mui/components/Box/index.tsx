import * as React from 'react';
import { 
  BoxTypeMap, 
  BoxOwnProps,
  createBox
} from '@mui/system';

import { 
  OverrideProps,
  OverridableComponent
} from '../../props';

import createBox2 from './createBox';


import {
  generateUtilityClasses,
  type Theme as MaterialTheme 
} from '../../styles';

import classNameGenerator from '@mui/utils/ClassNameGenerator';

import defaultTheme from '../../theme/defaultTheme';
import THEME_ID from '../../theme/identifier';




interface BoxAdditionalProps extends Record<string, unknown> {
  d?: BoxOwnProps['display'],
  w?: BoxOwnProps['width'],
  h?: BoxOwnProps['height'],
  g?: BoxOwnProps['gap'],
  cg?: BoxOwnProps['columnGap'],
  rg?: BoxOwnProps['rowGap'],
  c?: BoxOwnProps['color'],
  bg?: BoxOwnProps['bgcolor'],
  ps?: BoxOwnProps['paddingInlineStart'],
  pe?: BoxOwnProps['paddingInlineEnd'],
  
  ms?: BoxOwnProps['marginInlineStart'],
  me?: BoxOwnProps['marginInlineEnd'],

  fs?: BoxOwnProps['fontSize'],
  fw?: BoxOwnProps['fontWeight'],
  children?: React.ReactNode
}


export type BoxProps<
  RootComponent extends React.ElementType = BoxTypeMap['defaultComponent'],
  AdditionalProps = BoxAdditionalProps,
> = OverrideProps<BoxTypeMap<AdditionalProps, RootComponent, MaterialTheme>, RootComponent>;


export interface BoxClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type BoxClassKey = keyof BoxClasses;

const boxClasses: BoxClasses = generateUtilityClasses('MuxBox', ['root']);

type BoxType = ReturnType<typeof createBox<MaterialTheme, BoxAdditionalProps>>;

export const Box = createBox2<MaterialTheme, BoxAdditionalProps>({
  themeId: THEME_ID,
  defaultTheme,
  defaultClassName: boxClasses.root,
  generateClassName: classNameGenerator.generate,
}) as BoxType;

export default Box;


