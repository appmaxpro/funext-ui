import * as React from 'react';
import { SxProps, SystemProps } from '@mui/system';

import { 
  OverrideProps, 
  OverridableComponent,
  OverridableStringUnion
  //OverridableStringUnion
} from '../../props';

import type{
  Theme,

 } from '../../styles';
 import { TextClasses } from './textClasses';
 import {Colors} from '../../types/generic';

import { Variant } from '../../theme/createTypography';

export interface TypeText {
  primary: string;
  secondary: string;
  disabled: string;
}


export interface TextPropsVariantOverrides {}

export interface TextPropsColorOverrides {}

export interface TextOwnProps extends Omit<SystemProps<Theme>, 'color'> {
  /**
   * Set the text-align on the component.
   * @default 'inherit'
   */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TextClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   */
  color?:
    | Colors
    | OverridableStringUnion<
        | 'inherit'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'error'
        | 'info'
        | 'warning'
        | `text${Capitalize<keyof TypeText>}`,
        TextPropsColorOverrides
      >
    | (string & {}); // to work with v5 color prop type which allows any string
  /**
   * If `true`, the text will have a bottom margin.
   * @default false
   */
  gutterBottom?: boolean;
  /**
   * If `true`, the text will not wrap, but instead will truncate with a text overflow ellipsis.
   *
   * Note that text overflow can only happen with block or inline-block level elements
   * (the element needs to have a width in order to overflow).
   * @default false
   */
  noWrap?: boolean;
  /**
   * If `true`, the element will be a paragraph element.
   * @default false
   * @deprecated Use the `component` prop instead. This prop will be removed in v7. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  paragraph?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Applies the theme typography styles.
   * @default 'body1'
   */
  variant?: OverridableStringUnion<Variant | 'inherit', TextPropsVariantOverrides>;
  /**
   * The component maps the variant prop to a range of different HTML element types.
   * For instance, subtitle1 to `<h6>`.
   * If you wish to change that mapping, you can provide your own.
   * Alternatively, you can use the `component` prop.
   * @default {
   *   h1: 'h1',
   *   h2: 'h2',
   *   h3: 'h3',
   *   h4: 'h4',
   *   h5: 'h5',
   *   h6: 'h6',
   *   subtitle1: 'h6',
   *   subtitle2: 'h6',
   *   body1: 'p',
   *   body2: 'p',
   *   inherit: 'p',
   *   small: 'small'
   * }
   */
  variantMapping?: Partial<
    Record<OverridableStringUnion<Variant | 'inherit', TextPropsVariantOverrides>, string>
  >;

  fw?: 300 | 400 | 500 | 600 | 700 | 800 | 900 | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal'
}

export interface TextTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'span',
> {
  props: AdditionalProps & TextOwnProps;
  defaultComponent: RootComponent;
}

/**
 *
 * Demos:
 *
 * - [Breadcrumbs](https://next.mui.com/material-ui/react-breadcrumbs/)
 * - [Typography](https://next.mui.com/material-ui/react-typography/)
 *
 * API:
 *
 * - [Typography API](https://next.mui.com/material-ui/api/typography/)
 */
//declare const Typography: OverridableComponent<TypographyTypeMap>;

export type TextProps<
  RootComponent extends React.ElementType = TextTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<TextTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export default TextProps;