'use client';
import * as React from 'react';
import RadioButtonUncheckedIcon from '../internal/svg-icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '../internal/svg-icons/RadioButtonChecked';
import {
  alpha,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  useMuxDefaultProps,
} from "../../styles";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";

const RadioButtonIconRoot = styled('span', { shouldForwardProp: rootShouldForwardProp })({
  position: 'relative',
  display: 'flex',
});

const RadioButtonIconBackground = styled(RadioButtonUncheckedIcon)({
  // Scale applied to prevent dot misalignment in Safari
  transform: 'scale(1)',
});

const RadioButtonIconDot = styled(RadioButtonCheckedIcon)(
  memoTheme(({ theme }) => ({
    left: 0,
    position: 'absolute',
    transform: 'scale(0)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.shortest,
    }),
    variants: [
      {
        props: { checked: true },
        style: {
          transform: 'scale(1)',
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.shortest,
          }),
        },
      },
    ],
  })),
);

/**
 * @ignore - internal component.
 */
function RadioButtonIcon(props:any) {
  const { checked = false, classes = {}, size } = props;

  const ownerState = { ...props, checked };

  return (
    <RadioButtonIconRoot className={classes.root} ownerState={ownerState}>
      <RadioButtonIconBackground
        size={size}
        className={classes.background}
        ownerState={ownerState}
      />
      <RadioButtonIconDot size={size} className={classes.dot} ownerState={ownerState} />
    </RadioButtonIconRoot>
  );
}

export default RadioButtonIcon;