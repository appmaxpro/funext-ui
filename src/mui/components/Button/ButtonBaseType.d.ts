import * as React from 'react';
import type {ReactNode, ElementType, ComponentType} from "react";
import { 
  styled, 
  useMuiDefaultProps,
  composeClasses,
  clsx,
  type SxThemeProps, 

} from '../../styles';
import type{ TouchRippleProps } from './TouchRipple';

import type{ 
  OverrideProps, 
  OverridableComponent, 
  OverridableTypeMap 
} from '../../props';

import type{  ButtonBaseClasses, ButtonBaseClassKey } from './buttonBaseClasses';


export interface ButtonBaseOwnProps {
  /**
   * A ref for imperative actions.
   * It currently only supports `focusVisible()` action.
   */
  action?: React.Ref<ButtonBaseActions>;

  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ButtonBaseClasses>;
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * The component used to render a link when the `href` prop is provided.
   * @default 'a'
   */
  LinkComponent?: React.ElementType;
  /**
   * Callback fired when the component is focused with a keyboard.
   * We trigger a `onFocus` callback too.
   */
  onFocusVisible?: React.FocusEventHandler<any>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * @default 0
   */
  tabIndex?: NonNullable<React.HTMLAttributes<any>['tabIndex']>;

  /**
   * If `true`, the touch ripple effect is disabled.
   * @default false
   */

  ripple?: boolean;
  /**
   * If `true`, the base button will have a keyboard focus ripple.
   * @default false
   */
  focusRipple?: boolean;
  /**
   * Props applied to the `TouchRipple` element.
   */
  rippleProps?: Partial<TouchRippleProps>;
  /**
   * A ref that points to the `TouchRipple` element.
   */
  rippleClass?: string;

  /**
   * If `true`, the ripples are centered.
   * They won't start at the cursor interaction position.
   * @default false
   */
  centerRipple?: boolean;
}

export interface ButtonBaseTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'button',
> {
  props: AdditionalProps & ButtonBaseOwnProps;
  defaultComponent: RootComponent;
}

/**
 * utility to create component types that inherit props from ButtonBase.
 * This component has an additional overload if the `href` prop is set which
 * can make extension quite tricky
 */
export interface ExtendButtonBaseTypeMap<TypeMap extends OverridableTypeMap> {
  props: TypeMap['props'] & Omit<ButtonBaseTypeMap['props'], 'classes'>;
  defaultComponent: TypeMap['defaultComponent'];
}

export type ExtendButtonBase<TypeMap extends OverridableTypeMap> = ((
  props: { href: string } & OverrideProps<ExtendButtonBaseTypeMap<TypeMap>, 'a'>,
) => React.JSX.Element) &
  OverridableComponent<ExtendButtonBaseTypeMap<TypeMap>>;


export type ButtonBaseProps<
  RootComponent extends React.ElementType = ButtonBaseTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<ButtonBaseTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export interface ButtonBaseActions {
  focusVisible(): void;
}

