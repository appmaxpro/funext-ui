import React from "react";

import { RippleConfig, useRipple } from "../../ripple";
import { clsx } from "../../styles";

export interface TouchRippleProps extends RippleConfig {
  disabled?:boolean;
  rippleClassName?: string;
  children?: React.ReactNode;
  as?: React.ComponentType | string
};

export const TouchRipple = React.forwardRef<HTMLElement, TouchRippleProps>((
  {rippleClassName, as:Comp, children, ...props}, ref) => {

  const firstChild = React.Children.only(children) as any;
  const {onClick, href, to, disabled} = Comp ? props : firstChild?.props;
  const actionDisabled = (!!onClick || !!href || !!to || disabled)  && ( !Comp && !!props.disabled);

  const {ref: rippleRef, className, rippleId} = useRipple({
    ref,
    disabled: actionDisabled,
    className: rippleClassName
  });

  if (Comp) {
      return <Comp 
      {...(props as any)} 
      ref={rippleRef} 
      className={clsx(props.className, !actionDisabled && className)}
      data-ripple-id={rippleId}
      >
        {children}
      </Comp>
  }
  
  if (actionDisabled) {
    return React.cloneElement(firstChild, {...props, ref: rippleRef, 'data-ripple-id': rippleId});
  }

  return React.cloneElement(firstChild, 
       {...props,
         className: clsx(props.className, !actionDisabled && className, firstChild.props.className),
         ref: rippleRef,
         'data-ripple-id': rippleId
        });
});
TouchRipple.displayName = "Mux.TouchRipple";

export default TouchRipple;