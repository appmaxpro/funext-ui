import React from "react";
// @floating-ui
import { useMergeRefs, useFloatingRootContext } from "@floating-ui/react";

// context
import { useMenu } from "./MenuContext";

import { ChevronLeft, ChevronRight } from "../internal/svg-icons/chevron";

export interface MenuHandlerProps extends React.ComponentProps<any> {}

export const MenuHandler = React.forwardRef<HTMLElement, MenuHandlerProps>(
  ({ children, ...rest }, ref) => {
    const { getReferenceProps, getItemProps, reference, nested, open, rtl } = useMenu();

    const mergedRef = useMergeRefs([ref, reference]);
    const endIcon = rest.endIcon ?? children.props.endIcon;
    const ChevronIcon = rtl ? ChevronLeft : ChevronRight;
    const icon =
      nested && !endIcon ? (
        <ChevronIcon
          {...{
            className: `transition-transform ${open ? "rotate-90" : ""}`,
          }}
        />
      ) : (
        endIcon
      );

    const refProps = getReferenceProps({
      ...rest,
      ref: mergedRef,
      onClick(event) {
        event.stopPropagation();
        children.props.onClick?.(event);
      },
      ...(nested && {
        role: "menuitem",
        endIcon: icon,
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
