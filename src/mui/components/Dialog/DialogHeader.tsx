import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";
import { styled, type SxComponentProps } from "../../styles";
// context
import { useTailwindTheme } from "../../theme";

// types
import type { className, children } from "../../types/components/dialog";
import IconButton from "../IconButton";
import { MaterialIcon } from "../../../icons/material-icon";

export interface DialogHeaderProps extends SxComponentProps<"div"> {
  onClose?: ()=> void;
  titleClassName?: string;
  actions?: React.ReactNode;
  divider?: boolean;
}

const DialogHeaderRoot = styled('div', {
  name: 'Header',
  slot: 'MuxDialog'
})<SxComponentProps<any>>({
  display: 'flex',
  alignItems: 'center',
  flex: '0 0 auto',
  padding: '12px 16px',
  flexWrap: 'nowrap'
});

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, titleClassName, children, onClose, actions, divider, ...rest }, ref) => {
    // 1. init
    const { dialogHeader } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base, title },
    } = dialogHeader;

    // 3. set styles
    const dialogHeaderClasses = twMerge(classnames(objectsToString(base), divider && base.divider), defaultProps.className, className);
    const dialogHeaderTitleClasses = twMerge(classnames(objectsToString(title)), titleClassName);

    // 4. return
    return (
      <DialogHeaderRoot {...rest} ref={ref} className={dialogHeaderClasses}>
        <div className={dialogHeaderTitleClasses}>
          {children}
        </div>
        {actions}
        {onClose && <IconButton onClick={onClose}><MaterialIcon icon="close"/></IconButton>}
         
      </DialogHeaderRoot>
    );
  },
);

DialogHeader.displayName = "Mux.DialogHeader";

export default DialogHeader;
