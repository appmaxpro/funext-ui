import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";


// types
import { SxComponentProps, styled } from "../../styles";

const CardFooterRoot = styled('div', {
  name: 'MuxCardFooter',
  slot: 'Root'
})('');

export type CardFooterProps = SxComponentProps<"div"> & {
  divider?: boolean;
}

export const CardFooter = React.forwardRef<HTMLElement, CardFooterProps>(
  ({ divider, className, ...rest }, ref) => {
    // 1. init
    const { cardFooter } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = cardFooter;

    // 2. set default props
    divider = divider ?? defaultProps.divider;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const cardFooterClasses = twMerge(
      classnames(objectsToString(base.initial), { [objectsToString(base.divider)]: divider }),
      className,
    );

    // 4. return
    return (
      <CardFooterRoot {...rest} ref={ref as any} className={cardFooterClasses}/>
    );
  },
);


CardFooter.displayName = "Mux.CardFooter";

export default CardFooter;
