import * as React from 'react';
import { 
  BoxTypeMap, 
  BoxOwnProps,
} from '@mui/system';

import { 
  OverrideProps,
  OverridableComponent
} from '../../props';

import { Theme } from './../../styles';

export interface BoxAdditionalProps extends Record<string, unknown> {
  d?: BoxOwnProps['display'];
  w?: BoxOwnProps['width'];
  h?: BoxOwnProps['height'];
  g?: BoxOwnProps['gap'];
  cg?: BoxOwnProps['columnGap'];
  rg?: BoxOwnProps['rowGap'];
  c?: BoxOwnProps['color'];
  bg?: BoxOwnProps['bgcolor'];
  ps?: BoxOwnProps['paddingInlineStart'];
  pe?: BoxOwnProps['paddingInlineEnd'];
  
  ms?: BoxOwnProps['marginInlineStart'];
  me?: BoxOwnProps['marginInlineEnd'];

  fs?: BoxOwnProps['fontSize'];
  fw?: BoxOwnProps['fontWeight'];
  children?: React.ReactNode;
  items?: BoxOwnProps['alignItems'];
  justify?: BoxOwnProps['justifyContent'];
  rounded?: BoxOwnProps['borderRadius'];
}


export type BoxProps<
  RootComponent extends React.ElementType = BoxTypeMap['defaultComponent'],
  AdditionalProps = BoxAdditionalProps,
> = OverrideProps<BoxTypeMap<AdditionalProps, RootComponent, Theme>, RootComponent>;
