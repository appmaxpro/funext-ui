import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useAccordion } from "./AccordionContext";
import { useTailwindTheme } from "../../theme";
import { ButtonRoot } from "../Button";
import { SxThemeProps } from "../../styles";


function Icon({open}: {open?:boolean}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export interface AccordionHeaderProps extends React.ComponentProps<"button"> {
  className?: string;
  sx?: SxThemeProps;
  showIcon?: boolean;
  iconClass?: string;
}

export const AccordionHeader = React.forwardRef<HTMLButtonElement, AccordionHeaderProps>(
  ({ className, showIcon, iconClass, children, ...rest }, ref) => {
    // 1. init
    const { open, icon, disabled } = useAccordion();
    const { accordion } = useTailwindTheme();
    const {
      styles: { base },
    } = accordion;

    // 2. set default props
    className = className ?? "";

    // 3. set styles
    const buttonStyles = twMerge(
      classnames(
        objectsToString(base.header.initial),
        open && objectsToString(base.header.active)
      ),
      className,
    );
    const iconClasses = classnames(objectsToString(base.header.icon), iconClass);
    // 4. return
    return (
      <ButtonRoot {...rest} ref={ref} type="button" disabled={disabled} className={buttonStyles}>
        {children}
        <span className={iconClasses}>
          {showIcon 
            ? <Icon open={open}/>
            : <>
              {icon ??
                (open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))
                }
                
              </>
            }  
          </span>
      </ButtonRoot>
    );
  },
);

AccordionHeader.displayName = "Mux.AccordionHeader";

export default AccordionHeader;
