import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

import { SxComponentProps, styled } from "../../styles";

const CardBodyRoot = styled('div', {
  name: 'MuxCardBody',
  slot: 'Root'
})({
  padding: 16,
  '&:last-child': {
    paddingBottom: 24,
  },
});

export type CardBodyProps = SxComponentProps<"div"> & {};

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...rest }, ref) => {
    // 1. init
    const { cardBody } = useTailwindTheme();
    const {
      defaultProps,
      styles: { base },
    } = cardBody;

    // 2. set default props
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const cardBodyClasses = twMerge(classnames(objectsToString(base)), className);

    // 4. return
    return (
      <CardBodyRoot {...rest} ref={ref} className={cardBodyClasses}/>
    );
  },
);

CardBody.displayName = "Mux.CardBody";

export default CardBody;
