import React from "react";

import { useRipple } from "../../ripple";
import { SxComponentProps, styled, clsx } from "../../styles";

export interface ListItemRipple extends SxComponentProps<'button'> {
  disabled?:boolean;
  rippleClassName?: string;
};

export const ListItemRipple = React.forwardRef<HTMLElement, ListItemRipple>((
  {rippleClassName, children, ...props}, ref) => {

  const {ref: rippleRef, className} = useRipple({
    ref,
    disabled: !!props.disabled,
    className: rippleClassName
  });
  const firstChild = React.Children.only(children) as any;

  return React.cloneElement(firstChild, 
       {...props,
         className: clsx(props.className, className, firstChild.props.className),
         ref: rippleRef
        });
});


export default ListItemRipple;