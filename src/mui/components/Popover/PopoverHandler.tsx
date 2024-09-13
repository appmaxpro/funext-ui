import React from "react";
import type { ReactNode } from "react";

// @floating-ui
import { useMergeRefs } from "@floating-ui/react";

// context
import { usePopover } from "./PopoverContext";

// types
import { children } from "../../types/components/popover";

export interface PopoverHandlerProps extends React.ComponentProps<any> {
  children: ReactNode | React.ComponentProps<any>;
}

export const PopoverHandler = React.forwardRef<HTMLDivElement, PopoverHandlerProps>(
  ({ children, ...rest }, ref) => {
    const { getReferenceProps, reference } = usePopover();

    const mergedRef = useMergeRefs([ref, reference]);
    const copyProps = getReferenceProps({
      ...rest,
      ref: mergedRef,
    });
    
    var onClick = children.props?.onClick;

    //console.log("onClick:", onClick);

    return React.cloneElement(children, {
       ...copyProps,
       onClick: (e:any) => {
          copyProps.onClick?.(e);
          onClick?.(e);
       }
    });
  },
);


PopoverHandler.displayName = "Mux.PopoverHandler";

export default PopoverHandler;
