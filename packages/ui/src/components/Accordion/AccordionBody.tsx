import React from "react";
// utils
import classnames from "classnames";
import objectsToString from "../../utils/objectsToString";
import { twMerge } from "tailwind-merge";

// context
import { useAccordion } from "./AccordionContext";
import { useTailwindTheme } from "../../theme";

import { styled, SxThemeProps, SxComponentProps, clsx } from "../../styles";
import Collapse from "../Collapse";
import Panel from "../Panel";

export const AccordionBodyRoot = styled(Panel, {
  name: 'MuxAccordionBody',
  slot: 'Root'
})({
  width: '100%'
});

export interface AccordionBodyProps extends SxComponentProps {
  [key: string]: any;
}

export const AccordionBody = React.forwardRef<HTMLDivElement, AccordionBodyProps>(
  ({ className, children, ...rest }, ref) => {
    // 1. init
    const { open } = useAccordion();
    const { accordion } = useTailwindTheme();
    const {
      styles: { base },
    } = accordion;
    
    // 2. set default props
    className = className ?? "";


    const bodyClasses = twMerge(
          clsx(
            objectsToString(base.body),
          ),
          className,
        );
    
    // 5. return
    return (
      <Collapse open={!!open}>
          <AccordionBodyRoot
            {...rest}
            className={bodyClasses}
            ref={ref}
          >
            {children}
          </AccordionBodyRoot>
        </Collapse>
    );
  },
);

AccordionBody.displayName = "Mux.AccordionBody";

export default AccordionBody;
