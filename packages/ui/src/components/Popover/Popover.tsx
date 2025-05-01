import React from "react";
// @floating-ui
import {
  safePolygon,
} from "@floating-ui/react";

import Popper, { PopperProps } from "../Popper";
import { clsx, useTheme } from "../../styles";
import { EMPTY_RECORD } from "../../lib/constants";

const defaultContentProps =  {
  className:
    "rounded-lg bg-body text-body py-1.5 px-3 bg-slate-900 text-white break-words whitespace-normal text-sm",
};


export interface PopoverProps extends Omit<PopperProps, "trigger"> {}

const PopoverFc: React.FC<PopoverProps> = React.forwardRef<
  HTMLDivElement,
  PopoverProps
>(
  (
    {
      children,
      reference,
      zOffset,
      open: controlledOpen,
      onOpenChange: setControlledOpen,
      dismiss = EMPTY_RECORD,
      contentProps = defaultContentProps,
      ...rest
    },
    ref,
  ) => {
    
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const [labelId, setLabelId] = React.useState();
    const [descriptionId, setDescriptionId] = React.useState();

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    zOffset ??= useTheme().zIndex.modal;

    const hasReference = !!reference;

    let trigger = hasReference ? null : typeof children === "string" ? (
      <span>{children}</span>
    ) : (
      children
    );

    if (!hasReference) {
      if (typeof children === "string") {
        trigger = <span>{children}</span>;
      } else {
        const actChildren = React.Children.toArray(children);
        trigger = actChildren[0];
        children = actChildren.slice(1, -1);
      }
    }

    // 7. return
    return (
      <Popper
        trigger={trigger}
        dismiss={dismiss}
        zOffset={zOffset}
        open={open}
        onOpenChange={setOpen}
        clickProps={{
          enabled: controlledOpen == null
        }}
        navigate
        contentProps={contentProps}
        {...rest}
        ref={ref}

      >
        {children}
      </Popper>
    );
  },
);

export const Popover = Object.assign(PopoverFc, { safePolygon: safePolygon });
Popover.displayName = "Mux.Popover";

export default Popover;
