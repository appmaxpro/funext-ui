import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import values from "../../utils/values";

// context
import { useTailwindTheme } from "../../theme";
import { clsx, styled, SxThemeProps, type SxComponentProps } from "../../styles";
// types
import type {
  divider,
  className,
  children,
} from "../../types/components/dialog";
import { dialogClasses } from "./types";




export interface DialogBodyProps extends SxComponentProps<"div"> {
  divider?: boolean;
}

const DialogBodyRoot = styled("div", {
  name: "MuxDialogBody",
})<SxComponentProps<any>>({
  flex: "1 1 auto",
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  overflowY: 'auto',
  padding: '20px 24px',
    variants: [
      {
        props: ({ ownerState }:any) => ownerState.dividers,
        style: {
          padding: '16px 24px',
          borderTopWidth: 1,
          borderBottomWidth: 1,
        },
      },
      {
        props: ({ ownerState }:any) => !ownerState.dividers,
        style: {
          [`.${dialogClasses.header} + &`]: {
            paddingTop: 0,
          },
        },
      },
    ],

    

});

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ divider, className, children, ...rest }, ref) => {
    // 1. init
    
    const ownerState = {divider}
    // 4. return
    return (
      <DialogBodyRoot {...rest} ref={ref} className={clsx(dialogClasses.body, className)} ownerState={ownerState}>
        {children}
      </DialogBodyRoot>
    );
  },
);

DialogBody.displayName = "Mux.DialogBody";

export default DialogBody;
