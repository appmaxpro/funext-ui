import * as React from 'react';
import type { ButtonGroupProps } from './ButtonGroupType';

interface ButtonGroupContextType {
  className?: string;
  color?: ButtonGroupProps['color'];
  disabled?: boolean;
  disableElevation?: boolean;
  disableFocusRipple?: boolean;
  disableRipple?: boolean;
  fullWidth?: boolean;
  size?: ButtonGroupProps['size'];
  variant?: ButtonGroupProps['variant'];
}

/**
 * @ignore - internal component.
 */
export const ButtonGroupContext = React.createContext<ButtonGroupContextType>({});

if (process.env.NODE_ENV !== 'production') {
  ButtonGroupContext.displayName = 'ButtonGroupContext';
}


type ButtonPositionClassName = string;

/**
 * @ignore - internal component.
 */
export const ButtonGroupButtonContext = React.createContext<ButtonPositionClassName | undefined>(
  undefined,
);

if (process.env.NODE_ENV !== 'production') {
  ButtonGroupButtonContext.displayName = 'ButtonGroupButtonContext';
}


export default ButtonGroupContext;