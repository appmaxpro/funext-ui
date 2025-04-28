import { CreateStyledComponent, StyledComponent } from "@emotion/styled";
import * as React from "react";

function merge<
  ComponentProps extends {},
  SpecificComponentProps extends {} = {},
  JSXProps extends {} = {},
>(
  factory: CreateStyledComponent<
    ComponentProps,
    SpecificComponentProps,
    JSXProps
  >,
  props: any,
): CreateStyledComponent<ComponentProps, SpecificComponentProps, JSXProps> {
  return function (...args: any[]) 
     : StyledComponent<ComponentProps, SpecificComponentProps, JSXProps>{
    const C = factory(...args);
    function Instance({ className, ...other }: any, ref: any) {
      if (props.className) {
        className += " " + props.className;
      }
      return <C {...props} {...other} className={className} ref={ref} />;
    }

    return React.forwardRef(Instance) as any
  };
}

export default merge;
