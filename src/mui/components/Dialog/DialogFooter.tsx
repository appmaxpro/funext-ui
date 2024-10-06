import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { styled, SxComponentProps, StyledComponentOwner } from "../../styles";
// types
import type { className, children } from "../../types/components/dialog";



export interface DialogFooterProps extends SxComponentProps<"div"> {
  className?: className;
  children: children;
  divider?:boolean;
}

const DialogFooterRoot = styled('div', {
  name: 'DialogFooter',
  slot: 'MuxDialog'
})<SxComponentProps<any>>('') ;

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, divider, ...rest }, ref) => {
    // 1. init
    const { dialogFooter } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = dialogFooter;

    // 2. set default props
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const dialogFooterClasses = twMerge(classnames(objectsToString(base), divider && base.divider), className);

    // 4. return
    return (
      <DialogFooterRoot {...rest} ref={ref} className={dialogFooterClasses}>
        {children}
      </DialogFooterRoot>
    );
  },
);


DialogFooter.displayName = "Mux.DialogFooter";

export default DialogFooter;
