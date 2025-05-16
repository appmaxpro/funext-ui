import * as React from 'react';
import type{ 
  OverridableComponent, 
  OverrideProps,
  DistributiveOmit 
} from '../../theme/tw/props';

import type{ Theme, SxThemeProps } from '../../styles';
import { TextOwnProps } from '../Text';
import type{ LinkClasses } from './linkClasses';

export interface LinkOwnProps extends DistributiveOmit<LinkBaseProps, 'classes'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<LinkClasses>;
  /**
   * The color of the link.
   * @default 'primary'
   */
  color?: TextOwnProps['color'];
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * `classes` prop applied to the [`Typography`](/material-ui/api/typography/) element.
   */
  TypographyClasses?: TextOwnProps['classes'];
  /**
   * Controls when the link should have an underline.
   * @default 'always'
   */
  underline?: 'none' | 'hover' | 'always';
  /**
   * Applies the theme typography styles.
   * @default 'inherit'
   */
  variant?: TextOwnProps['variant'];
}

export interface LinkTypeMap<AdditionalProps = {}, RootComponent extends React.ElementType = 'a'> {
  props: AdditionalProps & LinkOwnProps;
  defaultComponent: RootComponent;
}

/**
 *
 * Demos:
 *
 * - [Breadcrumbs](https://next.mui.com/material-ui/react-breadcrumbs/)
 * - [Links](https://next.mui.com/material-ui/react-link/)
 *
 * API:
 *
 * - [Link API](https://next.mui.com/material-ui/api/link/)
 * - inherits [Typography API](https://next.mui.com/material-ui/api/typography/)
 */
//declare const Link: OverridableComponent<LinkTypeMap>;

export type LinkBaseProps = DistributiveOmit<
TextOwnProps,
  'children' | 'color' | 'variant' | 'classes'
> & {disabled?: boolean};

export type LinkProps<
  RootComponent extends React.ElementType = LinkTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<LinkTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export default LinkProps;