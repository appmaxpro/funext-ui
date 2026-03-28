import React from "react";

import { clsx, styled, type SxComponentProps } from "../../styles";
// context

// types
import IconButton from "../IconButton";
import Close from "../internal/svg-icons/Close";
import { dialogClasses } from "./dialogClasses";

export interface DialogHeaderProps extends SxComponentProps<"div"> {
  onClose?: ()=> void;
  titleClassName?: string;
  actions?: React.ReactNode;
  divider?: boolean;
}

const titleClass = 'DialogTitle';

const DialogHeaderRoot = styled('div', {
  name: 'MuxDialogHeader',
})<SxComponentProps<any>>({
  display: 'flex',
  alignItems: 'center',
  flex: '0 0 auto',
  padding: '12px 16px',
  flexWrap: 'nowrap',
  [`& .${titleClass}`]:{
     flex: '1'
  },
  ['& .MuxButtonBase-root']: {
    alignSelf: 'start'
  }
});

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, titleClassName, children, onClose, actions, divider, ...rest }, ref) => {
    
    // 4. return
    return (
      <DialogHeaderRoot {...rest} ref={ref} className={clsx(dialogClasses.dialogHeader, className)}>
        <div className={clsx(titleClass, titleClassName)}>
          {children}
        </div>
        {actions}
        {onClose && <IconButton onClick={onClose}><Close /></IconButton>}
         
      </DialogHeaderRoot>
    );
  },
);

DialogHeader.displayName = "Mux.DialogHeader";

export default DialogHeader;
