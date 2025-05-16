import React from "react";

// context
import { useTailwindTheme } from "../../theme";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

import {
  styled
}
from "../../styles";
import type{
  StyledComponent
}
from "../../styles";

import {IconButton, type IconButtonProps} from "../IconButton";
import { getAnimation } from "../internal/animation";

const SpeedDialActionRoot = styled(IconButton, {
  name: 'SpeedDialAction',
  slot: 'Root',
  shouldForwardProp: (propName) => propName !== "animate",
})({
  overflow: 'hidden',
}, getAnimation) as StyledComponent<IconButtonProps>;


export interface SpeedDialActionProps extends IconButtonProps {}

export const SpeedDialAction = React.forwardRef<HTMLButtonElement, SpeedDialActionProps>(
  ({ className, children, variant='filled', ...rest }, ref) => {
    // 1. init
    const {
      speedDialAction: { styles },
    } = useTailwindTheme();

    // 2. set styles
    const classes = twMerge(objectsToString(styles), className);

    // 3. return
    return (
      <SpeedDialActionRoot {...rest} ref={ref} className={classes}>
        {children}
      </SpeedDialActionRoot>
    );
  },
);

SpeedDialAction.displayName = "SpeedDialAction";

export default SpeedDialAction;
