"use strict";
import * as React from 'react';

import { 
  styled, 
  useMuiDefaultProps,
  composeClasses,
  clsx,
  SxThemeProps
} from '../../styles';


import type{ TouchRippleProps } from './TouchRipple';



import type{ 
  OverrideProps, 
  OverridableComponent, 
  OverridableTypeMap 
} from '../../props';

import { getButtonBaseUtilityClass, type ButtonBaseClasses, type ButtonBaseClassKey } from './buttonBaseClasses';

import buttonBaseClasses from './buttonBaseClasses';
import isFocusVisible from '@mui/utils/isFocusVisible';
import { useRipple } from '../../ripple';

const useUtilityClasses = (ownerState:any) => {
  const { disabled, focusVisible, focusVisibleClassName, classes } = ownerState;

  const slots = {
    root: ['root', disabled && 'disabled', focusVisible && 'focusVisible'],
  };

  const composedClasses = composeClasses(slots, getButtonBaseUtilityClass, classes);

  if (focusVisible && focusVisibleClassName) {
    composedClasses.root += ` ${focusVisibleClassName}`;
  }

  return composedClasses;
};

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
  rippleClassName?: string;

  focusVisibleClassName?: string;

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



export const ButtonBaseRoot = styled('button', {
  name: 'MuxButtonBase',
  overridesResolver: (props:any, styles:any) => styles.root,
})({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxSizing: 'border-box',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: 'transparent', // Reset default value
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
  border: 0,
  margin: 0, // Remove the margin in Safari
  borderRadius: 0,
  padding: 0, // Remove the padding in Firefox
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'middle',
  appearance: 'none',
  MozAppearance: 'none', // Reset
  WebkitAppearance: 'none', // Reset
  textDecoration: 'none',
  // So we take precedent over the style of a native <a /> element.
  color: 'inherit',
  '&::-moz-focus-inner': {
    borderStyle: 'none', // Remove Firefox dotted outline.
  },
  [`&.${buttonBaseClasses.disabled}`]: {
    pointerEvents: 'none', // Disable link interactions
    cursor: 'default',
  },
  '@media print': {
    colorAdjust: 'exact',
  },
});

/**
 * `ButtonBase` contains as few styles as possible.
 * It aims to be a simple building block for creating a button.
 * It contains a load of style reset and some focus/ripple logic.
 */
export const ButtonBase = React.forwardRef<HTMLElement, ButtonBaseProps>(function ButtonBase(inProps, ref) {
  const props = useMuiDefaultProps({ props: inProps, name: 'MuxButtonBase' }) as ButtonBaseProps;
  const {
    action,
    className,
    as,
    component = as ?? 'button',
    LinkComponent = 'a',
    disabled = false,
    onBlur,
    onClick,
    onFocus,
    onFocusVisible,
    tabIndex = 0,
    ripple = true,
    focusRipple = false,
    rippleProps,
    centerRipple = false,
    type,
    rippleClassName,
    focusVisibleClassName,
    ...other
  } = props;

  const rest:any = other;

  let ComponentProp = component;

  if (ComponentProp === 'button' && (rest.href || rest.to)) {
    ComponentProp = LinkComponent;
  }

  const buttonProps:any = {};
  if (ComponentProp === 'button') {
    buttonProps.type = type === undefined ? 'button' : type;
    buttonProps.disabled = disabled;
  } else {
    if ((!rest.href && !rest.to) && !other.role) {
      buttonProps.role = 'button';
    }
    if (disabled) {
      buttonProps['aria-disabled'] = disabled;
    }
  }


  const hasLink = ComponentProp == LinkComponent ;
  
  
  const actionDisabled = (disabled || (
       hasLink ? !(rest.href || rest.to)
               : !(onClick || true)));

  const focusDisabled = actionDisabled ? actionDisabled : !focusRipple;

  const {
    ref: rippleRef, 
    className:resultClass,
    fadeIn,
    fadeOut,
  } = useRipple({
        className: rippleClassName,
        centered: centerRipple,
        ...rippleProps,
        ref,
        disabled: actionDisabled || !ripple ,
     });

  const [focusVisible, setFocusVisible] = React.useState(false);

  React.useEffect(()=> {
    if (disabled || focusDisabled) {
      setFocusVisible(false);
    }
  }, [disabled, focusDisabled])
  

  React.useImperativeHandle(
    action,
    () => ({
      focusVisible: () => {
        setFocusVisible(true);
        //rippleRef.current?.focus();
      },
    }),
    [],
  );


  const handleBlur = React.useCallback((event:any) => {
      if (!focusDisabled && !isFocusVisible(event.target)) {
        fadeOut();
        setFocusVisible(false);
      }
      if (onBlur) {
        onBlur(event);
      }
    }, []);

  const handleFocus = React.useCallback((event:any) => {
    
    if (!focusDisabled && isFocusVisible(event.target)) {
      setFocusVisible(true);
      fadeIn(0, 0, {centered: true});
      if (onFocusVisible) {
        onFocusVisible(event);
      }
    }

    if (onFocus) {
      onFocus(event);
    }
  }, []);

  const ownerState = {
    ...props,
    centerRipple,
    component,
    disabled,
    focusRipple,
    tabIndex,
    focusVisible,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <ButtonBaseRoot
      as={ComponentProp}
      className={clsx(classes.root, className, resultClass, focusVisible && focusVisibleClassName)}
      ownerState={ownerState}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onClick={onClick}
      ref={rippleRef}
      tabIndex={disabled ? undefined : tabIndex}
      type={type}
      {...buttonProps}
      {...other}
    />
    
  );
});

ButtonBase.displayName = "Mux.ButtonBase";

export type{
  ButtonBaseClasses,
  ButtonBaseClassKey
}

export default ButtonBase;