import React from "react";
import type { ReactNode } from "react";
// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { AccordionContextProvider, useAccordion } from "./AccordionContext";

// accordion components
import { AccordionHeader, AccordionHeaderProps } from "./AccordionHeader";
import { AccordionBody, AccordionBodyProps } from "./AccordionBody";
import { AnimationProps } from "../../types/generic";

export interface AccordionProps extends React.ComponentProps<"div"> {
  open: boolean;
  icon?: string;
  animate?: AnimationProps;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const AccordionFc = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ open, icon, animate, className, disabled, children, ...rest }, ref) => {
    // 1. init
    const { accordion } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = accordion;

    // 2. set default props
    icon = icon ?? defaultProps.icon;
    animate = animate ?? defaultProps.animate;
    disabled = disabled ?? defaultProps.disabled;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const accordionClasses = twMerge(
      classnames(
        objectsToString(base.container),
        disabled && objectsToString(base.disabled),
      ),
      className,
    );

    // 4. memoize context value
    const contextValue = React.useMemo(
      () => ({ open, icon, animate, disabled }),
      [open, icon, animate, disabled],
    );

    // 5. return
    return (
      <AccordionContextProvider value={contextValue}>
        <div {...rest} ref={ref} className={accordionClasses}>
          {children}
        </div>
      </AccordionContextProvider>
    );
  },
);

const Accordion = Object.assign(AccordionFc, {
  Header: AccordionHeader,
  Body: AccordionBody,
});
Accordion.displayName = "Mux.Accordion";

export type { AccordionHeaderProps, AccordionBodyProps };
export { Accordion, AccordionHeader, AccordionBody, useAccordion };
export default Accordion;
