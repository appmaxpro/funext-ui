import React from "react";

// utils

// context
import { clsx, styled, type SxComponentProps } from "../../styles";
// types
import { dialogClasses } from "./dialogClasses";

export interface DialogBodyProps extends SxComponentProps<"div"> {
  divider?: boolean;
}

const DialogBodyRoot = styled("div", {
  name: "MuxDialogBody",
})<SxComponentProps<any>>({
  flex: "1 1 auto",
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  overflowY: "auto",
  padding: "20px 24px",
  "&::after": {
    content: '""',
    display: "inline-block",
    verticalAlign: "middle",
    height: 0,
    width: 0,
  },
  variants: [
    {
      props: ({ ownerState }: any) => ownerState.dividers,
      style: {
        padding: "16px 24px",
        borderTopWidth: 1,
        borderBottomWidth: 1,
      },
    },
    {
      props: ({ ownerState }: any) => !ownerState.dividers,
      style: {
        [`.${dialogClasses.dialogHeader} + &`]: {
          paddingTop: 0,
        },
        [`.${dialogClasses.dialogFooter} + &`]: {
          paddingBottom: 0,
        },
      },
    },
  ],
});

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ divider, className, children, ...rest }, ref) => {
    // 1. init

    const ownerState = { divider };
    // 4. return
    return (
      <DialogBodyRoot
        {...rest}
        ref={ref}
        className={clsx(dialogClasses.dialogBody, className)}
        ownerState={ownerState}
      >
        {children}
      </DialogBodyRoot>
    );
  },
);

DialogBody.displayName = "Mux.DialogBody";

export default DialogBody;
