import * as React from 'react';
import { 
  OverridableStringUnion,
  OverridableComponent, 
  OverrideProps 
} from '../../theme/tw/props';
import { 
  generateUtilityClass, 
  generateUtilityClasses,
  SxThemeProps 
} from "../../styles";

import { ButtonBaseProps } from '../Button/ButtonBase';

export interface ButtonGroupClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `variant="filled"`. */
  filled: string;
  /** Styles applied to the root element if `variant="outlined"`. */
  outlined: string;
  /** Styles applied to the root element if `variant="text"`. */
  text: string;

  ghost: string;
  /** Styles applied to the root element if `disableElevation={true}`. */
  disableElevation: string;
  /** State class applied to the child elements if `disabled={true}`. */
  disabled: string;
  /** Styles applied to the first button in the button group. */
  firstButton: string;
  /** Styles applied to the root element if `fullWidth={true}`. */
  fullWidth: string;
  /** Styles applied to the root element if `orientation="horizontal"`. */
  horizontal: string;
  /** Styles applied to the root element if `orientation="vertical"`. */
  vertical: string;
  /** Styles applied to the children. */
  grouped: string;
  /** Styles applied to the root element if `color="primary"` */
  colorPrimary: string;
  /** Styles applied to the root element if `color="secondary"` */
  colorSecondary: string;
  /** Styles applied to the children if `orientation="horizontal"`.
   * @deprecated Combine the [.MuxButtonGroup-horizontal](/material-ui/api/button-group/#button-group-classes-horizontal) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedHorizontal: string;
  /** Styles applied to the children if `orientation="vertical"`.
   * @deprecated Combine the [.MuxButtonGroup-vertical](/material-ui/api/button-group/#button-group-classes-vertical) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedVertical: string;
  /** Styles applied to the children if `variant="text"`.
   * @deprecated Combine the [.MuxButtonGroup-text](/material-ui/api/button-group/#button-group-classes-text) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedText: string;
  /** Styles applied to the children if `variant="text"` and `orientation="horizontal"`.
   * @deprecated Combine the [.MuxButtonGroup-text](/material-ui/api/button-group/#button-group-classes-text) , [.MuxButtonGroup-horizontal](/material-ui/api/button-group/#button-group-classes-horizontal) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedTextHorizontal: string;
  /** Styles applied to the children if `variant="text"` and `orientation="vertical"`.
   * @deprecated Combine the [.MuxButtonGroup-text](/material-ui/api/button-group/#button-group-classes-text) , [.MuxButtonGroup-vertical](/material-ui/api/button-group/#button-group-classes-vertical) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedTextVertical: string;
  /** Styles applied to the children if `variant="text"` and `color="primary"`.
   * @deprecated Combine the [.MuxButtonGroup-text](/material-ui/api/button-group/#button-group-classes-text) , [.MuxButtonGroup-colorPrimary](/material-ui/api/button-group/#button-group-classes-colorPrimary) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedTextPrimary: string;
  /** Styles applied to the children if `variant="text"` and `color="secondary"`.
   * @deprecated Combine the [.MuxButtonGroup-text](/material-ui/api/button-group/#button-group-classes-text) , [.MuxButtonGroup-colorSecondary](/material-ui/api/button-group/#button-group-classes-colorSecondary) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedTextSecondary: string;
  /** Styles applied to the children if `variant="outlined"`.
   * @deprecated Combine the [.MuxButtonGroup-outlined](/material-ui/api/button-group/#button-group-classes-outlined) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedOutlined: string;
  /** Styles applied to the children if `variant="outlined"` and `orientation="horizontal"`.
   * @deprecated Combine the [.MuxButtonGroup-outlined](/material-ui/api/button-group/#button-group-classes-outlined) , [.MuxButtonGroup-horizontal](/material-ui/api/button-group/#button-group-classes-horizontal) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedOutlinedHorizontal: string;
  /** Styles applied to the children if `variant="outlined"` and `orientation="vertical"`.
   * @deprecated Combine the [.MuxButtonGroup-outlined](/material-ui/api/button-group/#button-group-classes-outlined) , [.MuxButtonGroup-vertical](/material-ui/api/button-group/#button-group-classes-vertical) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedOutlinedVertical: string;
  /** Styles applied to the children if `variant="outlined"` and `color="primary"`.
   * @deprecated Combine the [.MuxButtonGroup-outlined](/material-ui/api/button-group/#button-group-classes-outlined) , [.MuxButtonGroup-colorPrimary](/material-ui/api/button-group/#button-group-classes-colorPrimary) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedOutlinedPrimary: string;
  /** Styles applied to the children if `variant="outlined"` and `color="secondary"`.
   * @deprecated Combine the [.MuxButtonGroup-outlined](/material-ui/api/button-group/#button-group-classes-outlined) , [.MuxButtonGroup-colorSecondary](/material-ui/api/button-group/#button-group-classes-colorSecondary) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedOutlinedSecondary: string;
  /** Styles applied to the children if `variant="filled"`.
   * @deprecated Combine the [.MuxButtonGroup-filled](/material-ui/api/button-group/#button-group-classes-filled) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedFilled: string;
  /** Styles applied to the children if `variant="filled"` and `orientation="horizontal"`.
   * @deprecated Combine the [.MuxButtonGroup-filled](/material-ui/api/button-group/#button-group-classes-filled) , [.MuxButtonGroup-horizontal](/material-ui/api/button-group/#button-group-classes-horizontal) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedFilledHorizontal: string;
  /** Styles applied to the children if `variant="filled"` and `orientation="vertical"`.
   * @deprecated Combine the [.MuxButtonGroup-filled](/material-ui/api/button-group/#button-group-classes-filled) , [.MuxButtonGroup-vertical](/material-ui/api/button-group/#button-group-classes-vertical) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedFilledVertical: string;
  /** Styles applied to the children if `variant="filled"` and `color="primary"`.
   * @deprecated Combine the [.MuxButtonGroup-filled](/material-ui/api/button-group/#button-group-classes-filled) , [.MuxButtonGroup-colorPrimary](/material-ui/api/button-group/#button-group-classes-colorPrimary) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedFilledPrimary: string;
  /** Styles applied to the children if `variant="filled"` and `color="secondary"`.
   * @deprecated Combine the [.MuxButtonGroup-filled](/material-ui/api/button-group/#button-group-classes-filled) , [.MuxButtonGroup-colorSecondary](/material-ui/api/button-group/#button-group-classes-colorSecondary) and [.MuxButtonGroup-grouped](/material-ui/api/button-group/#button-group-classes-grouped) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  groupedFilledSecondary: string;

  groupedGhost: string;
  groupedGhostHorizontal: string;
  groupedGhostVertical: string;
  groupedGhostPrimary: string;
  groupedGhostSecondary: string;
  /** Styles applied to the last button in the button group. */
  lastButton: string;
  /** Styles applied to buttons in the middle of the button group. */
  middleButton: string;
}

export type ButtonGroupClassKey = keyof ButtonGroupClasses;

export function getButtonGroupUtilityClass(slot: string): string {
  return generateUtilityClass('MuxButtonGroup', slot);
}

export const buttonGroupClasses: ButtonGroupClasses = generateUtilityClasses('MuxButtonGroup', [
  'root',
  'filled',
  'outlined',
  'text',
  'ghost',
  'disableElevation',
  'disabled',
  'firstButton',
  'fullWidth',
  'horizontal',
  'vertical',
  'colorPrimary',
  'colorSecondary',
  'grouped',
  'groupedHorizontal',
  'groupedVertical',
  'groupedText',
  'groupedTextHorizontal',
  'groupedTextVertical',
  'groupedTextPrimary',
  'groupedTextSecondary',
  'groupedOutlined',
  'groupedOutlinedHorizontal',
  'groupedOutlinedVertical',
  'groupedOutlinedPrimary',
  'groupedOutlinedSecondary',
  'groupedFilled',
  'groupedFilledHorizontal',
  'groupedFilledVertical',
  'groupedFilledPrimary',
  'groupedFilledSecondary',
  'groupedGhost',
  'groupedGhostHorizontal',
  'groupedGhostVertical',
  'groupedGhostPrimary',
  'groupedGhostSecondary',
  'lastButton',
  'middleButton',
]);




export interface ButtonGroupPropsColorOverrides {}
export interface ButtonGroupPropsVariantOverrides {}
export interface ButtonGroupPropsSizeOverrides {}

export interface ButtonGroupOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ButtonGroupClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: OverridableStringUnion<
    'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'dark' | 'light',
    ButtonGroupPropsColorOverrides
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
   * If `true`, the button keyboard focus ripple.
   * @default true
   */
  focusRipple?: ButtonBaseProps['focusRipple'];
  /**
   * If `true`, the button ripple effect.
   * @default true
   */
  ripple?: ButtonBaseProps['ripple'];
  /**
   * If `true`, the buttons will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * The component orientation (layout flow direction).
   * @default 'horizontal'
   */
  orientation?: 'vertical' | 'horizontal';

  vertical?: boolean;
  /**
   * The size of the component.
   * `small` is equivalent to the dense button styling.
   * @default 'medium'
   */
  size?: OverridableStringUnion<'sm' | 'md' | 'lg', ButtonGroupPropsSizeOverrides>;
  /**
   * The variant to use.
   * @default 'outlined'
   */
  variant?: OverridableStringUnion<
    'text' | 'outlined' | 'filled' | 'ghost',
    ButtonGroupPropsVariantOverrides
  >;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

export interface ButtonGroupTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps & ButtonGroupOwnProps;
  defaultComponent: RootComponent;
}


export type ButtonGroupProps<
  RootComponent extends React.ElementType = ButtonGroupTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<ButtonGroupTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export default ButtonGroupProps;