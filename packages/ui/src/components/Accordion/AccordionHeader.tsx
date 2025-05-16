import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useAccordion } from "./AccordionContext";
import { useTailwindTheme } from "../../theme";
import { ButtonBase } from "../Button";
import { clsx, SxThemeProps , styled} from "../../styles";
import { composeEventHandlers } from "../../hooks/compose-event-handlers";
import { ChevronDown } from "../internal/svg-icons/chevron";

const ButtonRoot = styled(ButtonBase, {
  name: 'AccordionHeader',
  slot: 'Root'
})('');

function Icon({open}: {open?:boolean}) {
  return (
    <ChevronDown
      className={`${open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    />
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
    const { open, icon, disabled, setOpen } = useAccordion();
    const { accordion } = useTailwindTheme();
    const {
      styles: { base },
    } = accordion;

    // 2. set default props
    className = className ?? "";

    // 3. set styles
    const buttonStyles = twMerge(
      clsx(
        objectsToString(base.header.initial),
        open && objectsToString(base.header.active)
      ),
      className,
    );
    const iconClasses = clsx(objectsToString(base.header.icon), iconClass);
    // 4. return
    return (
      <ButtonRoot {...rest} onClick={composeEventHandlers(()=> setOpen(!open), rest.onClick)}  ref={ref} type="button" disabled={disabled} className={buttonStyles}>
        {children}
        <span className={iconClasses}>
          {(showIcon ?? !icon) 
            ? <Icon open={open}/>
            : icon
            }  
          </span>
      </ButtonRoot>
    );
  },
);

AccordionHeader.displayName = "Mux.AccordionHeader";

export default AccordionHeader;
