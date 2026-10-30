import React from "react";
// @floating-ui
import {
  safePolygon,
} from "@floating-ui/react";

import Popper, { PopperProps } from "../Popper";
import { clsx, styled, StyledComponent, useTheme } from "../../styles";
import { EMPTY_RECORD } from "../../lib/constants";
import { getAnimationOrName, shouldForwardProp } from "../internal/animation";
import Panel from "../Panel";

const defaultContentProps =  {
  className:
    "rounded-lg bg-card text-card-fg py-1.5 px-3 break-words whitespace-normal text-sm",
};


const PanelRoot = styled(Panel, {
  name: "MuxMenu",
  slot: "panel",
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp,
})(
  ({ theme }) => ({
    ...theme.typography.body1,
    boxShadow:
      "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
    willChange: "transform, opacity",
    borderRadius: 12,
    maxWidth: "var(--popper-available-width)",
    maxHeight: "var(--popper-available-height)",
    borderWidth: 1,
  }),
  getAnimationOrName("fadeScale"),
) as StyledComponent<any>;

const defaultAnimation = {
  animate: true,
  animation: "fadeScale"
}

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

    if (!hasReference && controlledOpen == null) {
      if (typeof children === "string") {
        trigger = <span>{children}</span>;
      } else {
        const actChildren = React.Children.toArray(children);
        trigger = React.cloneElement(actChildren[0] as any);
        children = React.cloneElement(actChildren.slice(1) as any);      trigger = React.cloneElement(actChildren[0] as any);

      }
    }

    // 7. return
    return (
      <Popper
        trigger={trigger}
        reference={reference}
        dismiss={dismiss}
        zOffset={zOffset}
        open={open}
        onOpenChange={setOpen}
        clickProps={{
          enabled: controlledOpen == null
        }}
        Content={PanelRoot}
        contentProps={contentProps}
        //animation={rest.animate ?  "fadeScale" : undefined}
        {...rest}
        ref={ref}
        hoverProps={{enabled: false}}
      >
        {children}
      </Popper>
    );
  },
);

export const Popover = Object.assign(PopoverFc, { 
  safePolygon: safePolygon ,
  Trigger: Popper.Trigger
});
Popover.displayName = "Mux.Popover";

export default Popover;
