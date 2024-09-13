import React from "react";

import { MaterialIcon } from "../../../icons/material-icon";
// @floating-ui
import { useMergeRefs } from "@floating-ui/react";

// context
import { useMenu } from "./MenuContext";

// types
import type { children } from "../../types/components/menu";

export interface MenuHandlerProps extends React.ComponentProps<any> {
  children: children | React.ComponentProps<any>;
}

export const MenuHandler = React.forwardRef<HTMLElement, MenuHandlerProps>(
  ({ children, ...rest }, ref) => {
    const { getReferenceProps, reference, nested, open, rtl } = useMenu();

    const mergedRef = useMergeRefs([ref, reference]);
    const endIcon = rest.endIcon ?? children.endIcon ;

    const icon = ((nested && !endIcon) ? 
      <MaterialIcon {...{
          icon:`keyboard_arrow_${rtl ? 'left' : 'right'}`,
          className:`transition-transform ${open ? 'rotate-90' : ''}`
        }}
      />
      : endIcon);

    const refProps = getReferenceProps({
      ...rest,
      ref: mergedRef,
      onClick(event) {
        event.stopPropagation();
      },
      ...(nested && {
        role: "menuitem",
        endIcon: icon
      }),
    });
    //console.log("MenuHandler: ReferenceProps:", refProps)
    return React.cloneElement(children, {
      ...refProps,
    });
  },
);


MenuHandler.displayName = "Mux.MenuHandler";

export default MenuHandler;
