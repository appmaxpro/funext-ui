import React from "react";

import { styled, SxComponentProps, StyledComponentOwner, clsx } from "../../styles";
// types
import type { className, children } from "../../types/components/dialog";
import { dialogClasses } from "./dialogClasses";

export interface DialogFooterProps extends SxComponentProps<"div"> {
  className?: className;
  children: children;
  divider?:boolean;
}

const DialogFooterRoot = styled('div', {
  name: 'MuxDialogFooter',
})<SxComponentProps<any>>({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flex: '0 0 auto',
  padding: 8,
  
}) ;

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, divider, ...rest }, ref) => {
    
    // 4. return
    return (
      <DialogFooterRoot {...rest} ref={ref} className={clsx(dialogClasses.dialogFooter, className) }>
        {children}
      </DialogFooterRoot>
    );
  },
);


DialogFooter.displayName = "Mux.DialogFooter";

export default DialogFooter;
