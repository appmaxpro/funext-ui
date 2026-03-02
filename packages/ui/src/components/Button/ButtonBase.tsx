"use strict";
import * as React from "react";

import {
  styled,
  useMuxDefaultProps,
  composeClasses,
  clsx,
  SxThemeProps,
  generateUtilityClass,
  generateUtilityClasses,
} from "../../styles";

import type { TouchRippleActions, TouchRippleProps } from "./TouchRipple";

import type {
  OverrideProps,
  OverridableComponent,
  OverridableTypeMap,
} from "../../theme/tw/props";


import isFocusVisible from "@mui/utils/isFocusVisible";
import { useEventCallback, useRefs } from "../../hooks";
import useLazyRipple from "../../hooks/use-lazy-ripple";
import TouchRipple from "./TouchRipple";


export interface ButtonBaseClasses {
  /** Styles applied to the root element. */
  root: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
  /** State class applied to the root element if keyboard focused. */
  focusVisible: string;
}

export type ButtonBaseClassKey = keyof ButtonBaseClasses;

export function getButtonBaseUtilityClass(slot: string): string {
  return generateUtilityClass('MuxButtonBase', slot);
}

export const buttonBaseClasses: ButtonBaseClasses = generateUtilityClasses('MuxButtonBase', [
  'root',
  'disabled',
  'focusVisible',
]);

const useUtilityClasses = (ownerState: any) => {
  const { disabled, focusVisible, focusVisibleClassName, classes } = ownerState;

  const slots = {
    root: ["root", disabled && "disabled", focusVisible && "focusVisible"],
  };

  const composedClasses = composeClasses(
    slots,
    getButtonBaseUtilityClass,
    classes,
  );

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
  tabIndex?: NonNullable<React.HTMLAttributes<any>["tabIndex"]>;

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

  to?: any

}

export interface ButtonBaseTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = "button",
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
  props: TypeMap["props"] & Omit<ButtonBaseTypeMap["props"], "classes">;
  defaultComponent: TypeMap["defaultComponent"];
}

export type ExtendButtonBase<TypeMap extends OverridableTypeMap> = ((
  props: { href: string } & OverrideProps<
    ExtendButtonBaseTypeMap<TypeMap>,
    "a"
  >,
) => React.JSX.Element) &
  OverridableComponent<ExtendButtonBaseTypeMap<TypeMap>>;

export type ButtonBaseProps<
  RootComponent extends
    React.ElementType = ButtonBaseTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  ButtonBaseTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
  touchRippleRef?: React.Ref<TouchRippleActions>;
};

export interface ButtonBaseActions {
  focusVisible(): void;
}

export const ButtonBaseRoot = styled("button", {
  name: "MuxButtonBase",
  overridesResolver: (props: any, styles: any) => styles.root,
})({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  boxSizing: "border-box",
  WebkitTapHighlightColor: "transparent",
  backgroundColor: "transparent", // Reset default value
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
  border: 0,
  margin: 0, // Remove the margin in Safari
  borderRadius: 0,
  padding: 0, // Remove the padding in Firefox
  cursor: "pointer",
  userSelect: "none",
  verticalAlign: "middle",
  appearance: "none",
  MozAppearance: "none", // Reset
  WebkitAppearance: "none", // Reset
  textDecoration: "none",
  // So we take precedent over the style of a native <a /> element.
  color: "inherit",
  "&::-moz-focus-inner": {
    borderStyle: "none", // Remove Firefox dotted outline.
  },
  [`&.${buttonBaseClasses.disabled}`]: {
    pointerEvents: "none", // Disable link interactions
    cursor: "default",
  },
  "@media print": {
    colorAdjust: "exact",
  },
});

/**
 * `ButtonBase` contains as few styles as possible.
 * It aims to be a simple building block for creating a button.
 * It contains a load of style reset and some focus/ripple logic.
 */
export const ButtonBase = React.forwardRef<HTMLElement, ButtonBaseProps>(
  function ButtonBase(inProps, ref) {
    const props = useMuxDefaultProps({
      props: inProps,
      name: "MuxButtonBase",
    }) as ButtonBaseProps;
    const {
      action,
      className,
      as,
      component = as ?? "button",
      LinkComponent = "a",
      disabled = false,
      onBlur,
      onClick,
      onFocus,
      onFocusVisible,
      onKeyDown,
      onKeyUp,
      onMouseDown,
      onMouseUp,
      onDragLeave,      
      onMouseLeave,
      /*
      onContextMenu,
      onTouchMove,*/
      
      onTouchEnd,
      onTouchStart,
      tabIndex = 0,
      ripple:rippleEnabled = true,
      focusRipple = false,
      rippleProps,
      centerRipple = false,
      type,
      rippleClassName,
      focusVisibleClassName,
      touchRippleRef,
      children,
      classes:otherClasses,
      //@ts-ignore
      ownerState: _ownerState,
      //@ts-ignore
      ownerstate,
      ...other
    } = props;

    const rest: any = other;

    const ripple = useLazyRipple();
    const rippleRef = useRefs(ripple.ref, touchRippleRef);

    let ComponentProp = component;

    if (ComponentProp === "button" && (rest.href || rest.to)) {
      ComponentProp = LinkComponent;
    }

    const buttonProps: any = {};
    if (ComponentProp === "button") {
      buttonProps.type = type === undefined ? "button" : type;
      buttonProps.disabled = disabled;
    } else {
      if (!rest.href && !rest.to && !other.role) {
        buttonProps.role = "button";
      }
      if (disabled) {
        buttonProps["aria-disabled"] = disabled;
      }
    }

    const hasLink = ComponentProp == LinkComponent;

    const actionDisabled =
      disabled || (hasLink ? !(rest.href || rest.to) : !(onClick || true));

    const focusDisabled = actionDisabled ? actionDisabled : !focusRipple;
    const disableTouchRipple = !rippleEnabled || actionDisabled;
    
    
    const enableTouchRipple = ripple.shouldMount && !disableTouchRipple;
    
    //console.log("disableTouchRipple:", disableTouchRipple, ", enableTouchRipple:", enableTouchRipple, ", rippleEnabled:", rippleEnabled, ", actionDisabled:", actionDisabled)

    const [focusVisible, setFocusVisible] = React.useState(false);

    React.useEffect(() => {
      if (disabled || focusDisabled) {
        setFocusVisible(false);
      }
    }, [disabled, focusDisabled]);

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

    React.useEffect(() => {
      //console.log("focusVisible:", focusVisible, ", focusRipple:", focusRipple, ", enableTouchRipple:",enableTouchRipple);
      if (focusVisible && focusRipple && !disableTouchRipple) {
        ripple.pulsate();
      }
    }, [disableTouchRipple, focusRipple, focusVisible, ripple]);

    const handleMouseDown = useRippleHandler(ripple, 'start', onMouseDown, disableTouchRipple);
    const handleMouseUp = useRippleHandler(ripple, 'stop', onMouseUp, disableTouchRipple);
    const handleDragLeave = useRippleHandler(ripple, 'stop', onDragLeave, disableTouchRipple);
    const handleMouseLeave = useRippleHandler(
      ripple,
      'stop',
      onMouseLeave,
      focusVisible ? true : disableTouchRipple,
    );
    /*
    const handleContextMenu = useRippleHandler(ripple, 'stop', onContextMenu, disableTouchRipple);
    
    
    const handleTouchMove = useRippleHandler(ripple, 'stop', onTouchMove, disableTouchRipple);
    */
    const handleTouchStart = useRippleHandler(ripple, 'start', onTouchStart, disableTouchRipple);
    const handleTouchEnd = useRippleHandler(ripple, 'stop', onTouchEnd, disableTouchRipple);
    
  
    const handleBlur = useRippleHandler(
      ripple,
      'stop',
      (event:React.FocusEvent<HTMLButtonElement>) => {
        if (!isFocusVisible(event.target)) {
          setFocusVisible(false);
        }
        if (onBlur) {
          onBlur(event);
        }
      },
      false,
    );
  
    const handleFocus = useEventCallback((event:React.FocusEvent<HTMLButtonElement>) => {
      // Fix for https://github.com/facebook/react/issues/7769
      /*
      if (!buttonRef.current) {
        buttonRef.current = event.currentTarget;
      }*/
  
      if (isFocusVisible(event.target)) {
        setFocusVisible(true);
  
        if (onFocusVisible) {
          onFocusVisible(event);
        }
      }
  
      if (onFocus) {
        onFocus(event);
      }
    });
  
    const isNonNativeButton = () => buttonProps.type === 'button' || hasLink;
  
    const handleKeyDown = useEventCallback((event:React.KeyboardEvent<HTMLButtonElement>) => {
      // Check if key is already down to avoid repeats being counted as multiple activations
      if (focusRipple && !event.repeat && focusVisible && event.key === ' ') {
        ripple.stop(event, () => {
          ripple.start(event);
        });
      }
  
      if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ') {
        event.preventDefault();
      }
  
      if (onKeyDown) {
        onKeyDown(event);
      }
  
      // Keyboard accessibility for non interactive elements
      if (
        event.target === event.currentTarget &&
        isNonNativeButton() &&
        event.key === 'Enter' &&
        !disabled
      ) {
        event.preventDefault();
        if (onClick) {
          onClick(event as any);
        }
      }
    });
  
    const handleKeyUp = useEventCallback((event:React.KeyboardEvent<HTMLButtonElement>) => {
      // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
      // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
      if (focusRipple && event.key === ' ' && focusVisible && !event.defaultPrevented) {
        ripple.stop(event, () => {
          ripple.pulsate(event);
        });
      }
      if (onKeyUp) {
        onKeyUp(event);
      }
  
      // Keyboard accessibility for non interactive elements
      if (
        onClick &&
        event.target === event.currentTarget &&
        isNonNativeButton() &&
        event.key === ' ' &&
        !event.defaultPrevented
      ) {
        onClick(event as any);
      }
    });
    
    const ownerState = {
      ...props,
      centerRipple,
      component,
      disabled,
      disableTouchRipple,
      focusRipple,
      tabIndex,
      focusVisible,
    };

    const classes = useUtilityClasses(ownerState);

    return (
      <ButtonBaseRoot
        as={ComponentProp}
        className={clsx(
          classes.root,
          className,
          focusVisible && focusVisibleClassName,
        )}
        ref={ref}
        tabIndex={disabled ? undefined : tabIndex}

        
        onBlur={handleBlur}
        onClick={onClick}
        
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onDragLeave={handleDragLeave}
        onMouseLeave={handleMouseLeave}
/*
        onContextMenu={handleContextMenu}
        onTouchMove={handleTouchMove}*/
        type={type}
        {...buttonProps}
        {...other}
        //ownerState={ownerState}
      >
        {children}
        {enableTouchRipple ? (
        <TouchRipple ref={rippleRef as any} center={centerRipple} {...rippleProps} />
      ) : null}
        </ButtonBaseRoot>
    );
  },
);

function useRippleHandler(
  ripple: TouchRippleActions,
  rippleAction: keyof TouchRippleActions,
  eventCallback?: React.EventHandler<React.SyntheticEvent<HTMLElement>>,
  skipRippleAction:boolean = false,
) {
  return useEventCallback((event: React.SyntheticEvent<HTMLElement>) => {
    if (eventCallback) {
      eventCallback(event);
    }

    if (!skipRippleAction) {
      ripple[rippleAction](event);
    }

    return true;
  });
}

ButtonBase.displayName = "Mux.ButtonBase";


export default ButtonBase;
