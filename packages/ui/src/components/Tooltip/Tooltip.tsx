import React, { useEffect, useRef } from "react";
// @floating-ui
import {
  useRole,
  useFocus,
  safePolygon,
  useDelayGroupContext,
} from "@floating-ui/react";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

import Popper, { PopperProps } from "../Popper";
import { EMPTY_RECORD } from "../../lib/constants";
import { clsx } from "../../styles";

const defaultArrow = {
  className: "fill-slate-900",
  tipRadius: 2,
  style: { transform: "translateY(-1px)" },
};

const defaultContentProps = {
  className:
    "rounded-lg bg-body text-white py-1.5 px-3 bg-slate-900 break-words whitespace-normal text-sm",
};

export interface TooltipProps
  extends Omit<PopperProps, "elementProps" | "allowOverContent"> {
  content?: string | React.FC | React.ReactNode;
  interactive?: boolean;
  defaultOpen?: boolean;
  noRest?: number;
}

const TooltipFc: React.FC<TooltipProps> = React.forwardRef<
  HTMLDivElement,
  TooltipProps
>(
  (
    {
      defaultOpen = false,
      content,
      interactive,
      allowOverContent,
      children,
      open: controlledOpen,
      onOpenChange: setControlledOpen,
      reference,
      noRest,
      contentProps = defaultContentProps,
      arrow,
      ...rest
    },
    ref,
  ) => {
    const { delay, isInstantPhase } = useDelayGroupContext();
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const hasReference = !!reference;

    const trigger = hasReference ? null : typeof children === "string" ? (
      <span>{children}</span>
    ) : (
      children
    );

    const contentRef = useRef(null);

    useEffect(() => {
      contentRef.current = null;
    }, [content]);

    useEffect(() => {
      if (!hasReference && !contentRef.current) {
        contentRef.current =
          typeof content === "function" ? (content as Function)() : content;
      }
    }, [content]);

    const actualChildren = hasReference ? children : contentRef.current;

    // 7. return
    return (
      <Popper
        trigger={trigger}
        onlyHover={!allowOverContent}
        hover
        open={open}
        onOpenChange={setOpen}
        reference={reference}
        dismiss={EMPTY_RECORD}
        lazy
        contentProps={contentProps}
        hoverProps={{
          move: false,
          enabled: controlledOpen == null,
          restMs: isInstantPhase || noRest ? 0 : 150,
          delay,
          //handleClose: safePolygon(),
        }}
        {...rest}
        elementProps={(context) => [
          useFocus(context, {
            enabled: controlledOpen == null,
          }),
          useRole(context, { role: "label" }),
        ]}
        ref={ref}
        arrow={arrow === true ? defaultArrow : arrow}
      >
        {actualChildren}
      </Popper>
    );
  },
);

const Tooltip = Object.assign(TooltipFc, { safePolygon: safePolygon });
Tooltip.displayName = "Mux.Tooltip";

export default Tooltip;
