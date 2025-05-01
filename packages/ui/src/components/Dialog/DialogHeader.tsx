import React from "react";

import { clsx, styled, type SxComponentProps } from "../../styles";
// context

// types
import IconButton from "../IconButton";
import Close from "../internal/svg-icons/Close";
import { dialogClasses } from "./types";

export interface DialogHeaderProps extends SxComponentProps<"div"> {
  onClose?: ()=> void;
  titleClassName?: string;
  actions?: React.ReactNode;
  divider?: boolean;
}

const DialogHeaderRoot = styled('div', {
  name: 'MuxDialogHeader',
})<SxComponentProps<any>>({
  display: 'flex',
  alignItems: 'center',
  flex: '0 0 auto',
  padding: '12px 16px',
  flexWrap: 'nowrap'
});

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, titleClassName, children, onClose, actions, divider, ...rest }, ref) => {
    
    // 4. return
    return (
      <DialogHeaderRoot {...rest} ref={ref} className={clsx(dialogClasses.header, className)}>
        <div className={clsx(dialogClasses.title, className)}>
          {children}
        </div>
        {actions}
        {onClose && <IconButton onClick={onClose}><Close/></IconButton>}
         
      </DialogHeaderRoot>
    );
  },
);

DialogHeader.displayName = "Mux.DialogHeader";

export default DialogHeader;
