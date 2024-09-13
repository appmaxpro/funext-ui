import * as React from 'react';
import { 
  DistributiveOmit, 
  OverridableStringUnion,
  OverrideProps, 
  OverridableComponent, 
  OverridableTypeMap
} from '../../props';

import { ExtendButtonBase, ExtendButtonBaseTypeMap } from './ButtonBase';
import { 
  generateUtilityClass, 
  generateUtilityClasses ,
  SxThemeProps
} from '../../styles';

export interface ButtonClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `variant="text"`. */
  text: string;
  /** Styles applied to the root element if `variant="text"` and `color="inherit"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorInherit](/material-ui/api/button/#button-classes-colorInherit) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textInherit: string;
  /** Styles applied to the root element if `variant="text"` and `color="primary"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorPrimary](/material-ui/api/button/#button-classes-colorPrimary) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textPrimary: string;
  /** Styles applied to the root element if `variant="text"` and `color="secondary"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorSecondary](/material-ui/api/button/#button-classes-colorSecondary) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textSecondary: string;
  /** Styles applied to the root element if `variant="text"` and `color="success"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorSuccess](/material-ui/api/button/#button-classes-colorSuccess) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textSuccess: string;
  /** Styles applied to the root element if `variant="text"` and `color="error"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorError](/material-ui/api/button/#button-classes-colorError) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textError: string;
  /** Styles applied to the root element if `variant="text"` and `color="info"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorInfo](/material-ui/api/button/#button-classes-colorInfo) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textInfo: string;
  /** Styles applied to the root element if `variant="text"` and `color="warning"`.
   * @deprecated Combine the [.MuxButton-text](/material-ui/api/button/#button-classes-text) and [.MuxButton-colorWarning](/material-ui/api/button/#button-classes-colorWarning) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textWarning: string;
  /** Styles applied to the root element if `variant="outlined"`. */
  outlined: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="inherit"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorInherit](/material-ui/api/button/#button-classes-colorInherit) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedInherit: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="primary"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorPrimary](/material-ui/api/button/#button-classes-colorPrimary) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedPrimary: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="secondary"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorSecondary](/material-ui/api/button/#button-classes-colorSecondary) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedSecondary: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="success"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorSuccess](/material-ui/api/button/#button-classes-colorSuccess) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedSuccess: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="error"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorError](/material-ui/api/button/#button-classes-colorError) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedError: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="info"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorInfo](/material-ui/api/button/#button-classes-colorInfo) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedInfo: string;
  /** Styles applied to the root element if `variant="outlined"` and `color="warning"`.
   * @deprecated Combine the [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) and [.MuxButton-colorWarning](/material-ui/api/button/#button-classes-colorWarning) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedWarning: string;
  /** Styles applied to the root element if `variant="filled"`. */
  filled: string;
  /** Styles applied to the root element if `variant="filled"` and `color="inherit"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorInherit](/material-ui/api/button/#button-classes-colorInherit) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledInherit: string;
  /** Styles applied to the root element if `variant="filled"` and `color="primary"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorPrimary](/material-ui/api/button/#button-classes-colorPrimary) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledPrimary: string;
  /** Styles applied to the root element if `variant="filled"` and `color="secondary"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorSecondary](/material-ui/api/button/#button-classes-colorSecondary) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledSecondary: string;
  /** Styles applied to the root element if `variant="filled"` and `color="success"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorSuccess](/material-ui/api/button/#button-classes-colorSuccess) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledSuccess: string;
  /** Styles applied to the root element if `variant="filled"` and `color="info"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorInfo](/material-ui/api/button/#button-classes-colorInfo) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledInfo: string;
  /** Styles applied to the root element if `variant="filled"` and `color="error"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorError](/material-ui/api/button/#button-classes-colorError) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledError: string;
  /** Styles applied to the root element if `variant="filled"` and `color="warning"`.
   * @deprecated Combine the [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) and [.MuxButton-colorWarning](/material-ui/api/button/#button-classes-colorWarning) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledWarning: string;

  /** Styles applied to the root element if `disableElevation={true}`. */
  disableElevation: string;
  /** State class applied to the ButtonBase root element if the button is keyboard focused. */
  focusVisible: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
  /** Styles applied to the root element if `color="inherit"`. */
  colorInherit: string;
  /** Styles applied to the root element if `size="small"` and `variant="text"`.
   * @deprecated Combine the [.MuxButton-sizeSm](/material-ui/api/button/#button-classes-sizeSm) and [.MuxButton-text](/material-ui/api/button/#button-classes-text) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textSizeSm: string;
  /** Styles applied to the root element if `size="medium"` and `variant="text"`.
   * @deprecated Combine the [.MuxButton-sizeMd](/material-ui/api/button/#button-classes-sizeMd) and [.MuxButton-text](/material-ui/api/button/#button-classes-text) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textSizeMd: string;
  /** Styles applied to the root element if `size="large"` and `variant="text"`.
   * @deprecated Combine the [.MuxButton-sizeLg](/material-ui/api/button/#button-classes-sizeLg) and [.MuxButton-text](/material-ui/api/button/#button-classes-text) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  textSizeLg: string;
  /** Styles applied to the root element if `size="small"` and `variant="outlined"`.
   * @deprecated Combine the [.MuxButton-sizeSm](/material-ui/api/button/#button-classes-sizeSm) and [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedSizeSm: string;
  /** Styles applied to the root element if `size="medium"` and `variant="outlined"`.
   * @deprecated Combine the [.MuxButton-sizeMd](/material-ui/api/button/#button-classes-sizeMd) and [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedSizeMd: string;
  /** Styles applied to the root element if `size="large"` and `variant="outlined"`.
   * @deprecated Combine the [.MuxButton-sizeLg](/material-ui/api/button/#button-classes-sizeLg) and [.MuxButton-outlined](/material-ui/api/button/#button-classes-outlined) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  outlinedSizeLg: string;
  /** Styles applied to the root element if `size="small"` and `variant="filled"`.
   * @deprecated Combine the [.MuxButton-sizeSm](/material-ui/api/button/#button-classes-sizeSm) and [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledSizeSm: string;
  /** Styles applied to the root element if `size="medium"` and `variant="filled"`.
   * @deprecated Combine the [.MuxButton-sizeMd](/material-ui/api/button/#button-classes-sizeMd) and [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledSizeMd: string;
  /** Styles applied to the root element if `size="large"` and `variant="filled"`.
   * @deprecated Combine the [.MuxButton-sizeLg](/material-ui/api/button/#button-classes-sizeLg) and [.MuxButton-filled](/material-ui/api/button/#button-classes-filled) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  filledSizeLg: string;
  ghost: string;
  ghostPrimary: string;
  ghostSecondary: string;
  ghostInfo: string;
  ghostSuccess: string;
  ghostWarning: string;
  ghostError: string;
  ghostInherit: string;

  ghostSizeSm: string;
  ghostSizeMd: string;
  ghostSizeLg: string;
  /** Styles applied to the root element if `size="small"`. */
  sizeSm: string;
  /** Styles applied to the root element if `size="medium"`. */
  sizeMd: string;
  /** Styles applied to the root element if `size="large"`. */
  sizeLg: string;
  /** Styles applied to the root element if `fullWidth={true}`. */
  fullWidth: string;
  /** Styles applied to the icon element if supplied */
  icon: string;
  /** Styles applied to the startIcon element if supplied. */
  startIcon: string;
  /** Styles applied to the endIcon element if supplied. */
  endIcon: string;
  /** Styles applied to the icon element if supplied and `size="small"`.
   * @deprecated Combine the [.MuxButton-icon](/material-ui/api/button/#button-classes-icon) and [.MuxButtonSizeSm](/material-ui/api/button/#button-classes-sizeSm) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  iconSizeSm: string;
  /** Styles applied to the icon element if supplied and `size="medium"`.
   * @deprecated Combine the [.MuxButton-icon](/material-ui/api/button/#button-classes-icon) and [.MuxButtonSizeMd](/material-ui/api/button/#button-classes-sizeMd) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  iconSizeMd: string;
  /** Styles applied to the icon element if supplied and `size="large"`.
   * @deprecated Combine the [.MuxButton-icon](/material-ui/api/button/#button-classes-icon) and [.MuxButtonSizeLg](/material-ui/api/button/#button-classes-sizeLg) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  iconSizeLg: string;
  /** Styles applied to the root element if `color="primary"`. */
  colorPrimary: string;
  /** Styles applied to the root element if `color="secondary"`. */
  colorSecondary: string;
  /** Styles applied to the root element if `color="success"`. */
  colorSuccess: string;
  /** Styles applied to the root element if `color="error"`. */
  colorError: string;
  /** Styles applied to the root element if `color="info"`. */
  colorInfo: string;
  /** Styles applied to the root element if `color="warning"`. */
  colorWarning: string;
}

export type ButtonClassKey = keyof ButtonClasses;

export function getButtonUtilityClass(slot: string): string {
  return generateUtilityClass('MuxButton', slot);
}

export const buttonClasses: ButtonClasses = generateUtilityClasses('MuxButton', [
  'root',
  'text',
  'textInherit',
  'textPrimary',
  'textSecondary',
  'textSuccess',
  'textError',
  'textInfo',
  'textWarning',
  'outlined',
  'outlinedInherit',
  'outlinedPrimary',
  'outlinedSecondary',
  'outlinedSuccess',
  'outlinedError',
  'outlinedInfo',
  'outlinedWarning',
  'filled',
  'filledInherit',
  'filledPrimary',
  'filledSecondary',
  'filledSuccess',
  'filledError',
  'filledInfo',
  'filledWarning',
  'ghost',
  'ghostPrimary',
  'ghostSecondary',
  'ghostInfo',
  'ghostSuccess',
  'ghostWarning',
  'ghostError',
  'ghostInherit',
  'disableElevation',
  'focusVisible',
  'disabled',
  'colorInherit',
  'colorPrimary',
  'colorSecondary',
  'colorSuccess',
  'colorError',
  'colorInfo',
  'colorWarning',
  'textSizeSm',
  'textSizeMd',
  'textSizeLg',
  'outlinedSizeSm',
  'outlinedSizeMd',
  'outlinedSizeLg',
  'filledSizeSm',
  'filledSizeMd',
  'filledSizeLg',
  'ghostSizeSm',
  'ghostSizeMd',
  'ghostSizeLg',
  'sizeMd',
  'sizeSm',
  'sizeLg',
  'fullWidth',
  'startIcon',
  'endIcon',
  'icon',
  'iconSizeSm',
  'iconSizeMd',
  'iconSizeLg',
]);

export interface ButtonPropsVariantOverrides {}

export interface ButtonPropsColorOverrides {}

export interface ButtonPropsSizeOverrides {}

export interface ButtonOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ButtonClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: OverridableStringUnion<
    'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'dark' | 'light',
    ButtonPropsColorOverrides
  >;
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, no elevation is used.
   * @default false
   */
  disableElevation?: boolean;
  /**
   * If `true`, the  keyboard focus ripple is disabled.
   * @default false
   */
  disableFocusRipple?: boolean;
  /**
   * Element placed after the children.
   */
  endIcon?: React.ReactNode;
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * The URL to link to when the button is clicked.
   * If defined, an `a` element will be used as the root node.
   */
  href?: string;
  /**
   * The size of the component.
   * `small` is equivalent to the dense button styling.
   * @default 'medium'
   */
  size?: OverridableStringUnion<'sm' | 'md' | 'lg', ButtonPropsSizeOverrides>;
  /**
   * Element placed before the children.
   */
  startIcon?: React.ReactNode;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The variant to use.
   * @default 'text'
   */
  variant?: OverridableStringUnion<'text' | 'outlined' | 'filled' | 'ghost', ButtonPropsVariantOverrides>;
}

export type ButtonTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'button',
> = ExtendButtonBaseTypeMap<{
  props: AdditionalProps & ButtonOwnProps;
  defaultComponent: RootComponent;
}>;

/**
 * utility to create component types that inherit props from ButtonBase.
 * This component has an additional overload if the `href` prop is set which
 * can make extension quite tricky
 */
export interface ExtendButtonTypeMap<TypeMap extends OverridableTypeMap> {
  props: TypeMap['props'] &
    (TypeMap['props'] extends { classes?: Record<string, string> }
      ? DistributiveOmit<ButtonTypeMap['props'], 'classes'>
      : ButtonTypeMap['props']);
  defaultComponent: TypeMap['defaultComponent'];
}

export type ExtendButton<TypeMap extends OverridableTypeMap> = ((
  props: { href: string } & OverrideProps<ExtendButtonBaseTypeMap<TypeMap>, 'a'>,
) => React.JSX.Element) &
  OverridableComponent<ExtendButtonBaseTypeMap<TypeMap>>;


export type ButtonProps<
  RootComponent extends React.ElementType = ButtonTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<ButtonTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export default ButtonProps;