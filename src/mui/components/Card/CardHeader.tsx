import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  variant,
} from "../../types/components/card";
import { SxComponentProps, styled } from "../../styles";

const CardHeaderRoot = styled('div', {
  name: 'MuxCardHeader',
  slot: 'Root'
})('');

export interface CardHeaderProps extends SxComponentProps<"div"> {
  variant?: variant;
  color?: string;
  shadow?: boolean;
  floated?: boolean;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ variant, color, shadow, floated, className, ...rest }, ref) => {
    // 1. init
    const { cardHeader } = useTailwindTheme();
    const { defaultProps, styles, valid } = cardHeader;
    const { base, variants } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    color = color ?? defaultProps.color;
    shadow = shadow ?? defaultProps.shadow;
    floated = floated ?? defaultProps.floated;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const cardHeaderRoot = objectsToString(base.initial);
    const cardHeaderVariant = objectsToString(
      variants[findMatch(valid.variants, variant, "filled")][
        findMatch(valid.colors, color, "white")
      ],
    );


    const classes = twMerge(
      classnames(
        cardHeaderRoot,
        cardHeaderVariant,
        { [objectsToString(base.shadow)]: shadow },
        { [objectsToString(base.floated)]: floated },
      ),
      className,
    );

    // 4. return
    return (
      <CardHeaderRoot {...rest} ref={ref} className={classes} />
    );
  },
);

CardHeader.displayName = "Mux.CardHeader";

export default CardHeader;
