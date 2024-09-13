import * as React from "react";

import { withStyled} from "../styled";
import { TVariant } from "../system";

import {default as MuxButton} from "../../mui/components/Button";
import IconButton from "../../mui/components/IconButton";

import type{ 
  ButtonProps
} from "../../mui";

export interface ExButtonProps extends Omit<ButtonProps, 'variant'>{
  outline?: boolean;
  variant?: TVariant | "link" | "action" | ButtonProps['variant'];
  kColor?: string;
  [key: string]: any
}

const mapVariantColor:any = {
  info: 'blue',
  danger: 'red',
  success: 'green',
  warn: 'orange',
  dark: 'black',
  secondary: 'gray',
}

const mapColorVariant:any = {
  text: 'text',
  link: 'text',
  light: 'text',
}

let ButtonCmp:React.ForwardRefExoticComponent<ExButtonProps>;
try {

  const MuiButtonRoot = MuxButton;
  const MuiIconButtonRoot = IconButton;

  ButtonCmp = withStyled(MuxButton as any)<ExButtonProps>(
    ({ripple, variant, color, outline, ...rest}, ref) => {
    if (variant && variant in mapVariantColor) {
      color = mapVariantColor[variant!];
      variant = outline ? 'outlined' : undefined;
    } else if (variant && variant in mapColorVariant){
      variant = mapColorVariant[variant];
      variant = outline ? 'outlined' : variant;
    }

    variant = outline ? 'outlined' : variant;

    
    if (variant && variant === 'action' ) {
      return <MuiIconButtonRoot {...rest} color={color} ref={ref}/>
    }
    
    return (<MuiButtonRoot {...rest} variant={variant} color={color} ref={ref}/>);
  }) as React.ForwardRefExoticComponent<ExButtonProps>;

} catch(e) {
  console.error(e);
  ButtonCmp = React.forwardRef((props, ref) => (<button {...props} ref={ref}/>)) as React.ForwardRefExoticComponent<ExButtonProps>;
}

export const Button = ButtonCmp;

export default Button;