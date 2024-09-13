import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { styled, SxThemeProps, type SxComponentProps } from "../../styles";
// types
import type { divider, className, children } from "../../types/components/dialog";


export interface DialogBodyProps extends SxComponentProps<"div"> {
  divider?: divider;
  className?: className;
  children: children;
}

const DialogBodyRoot = styled('div', {
  name: 'MuxDialogBody',
  slot: 'Root'
})<SxComponentProps<any>>('');

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ divider, className, children, ...rest }, ref) => {
    // 1. init
    const { dialogBody } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = dialogBody;

    // 2. set default props
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const dialogBodyClasses = twMerge(
      classnames(objectsToString(base.initial), { [objectsToString(base.divider)]: divider }),
      className,
    );

    // 4. return
    return (
      <DialogBodyRoot {...rest} ref={ref} className={dialogBodyClasses}>
        {children}
      </DialogBodyRoot>
    );
  },
);

DialogBody.displayName = "Mux.DialogBody";

export default DialogBody;
