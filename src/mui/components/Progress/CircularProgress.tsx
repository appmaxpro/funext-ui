'use client';
import * as React from 'react';
import { 
  keyframes, 
  css, 
  styled,  
  clsx, 
  composeClasses, 
  useMuiDefaultProps,
  SxThemeProps
} from '../../styles';

import {capitalize} from '../../utils/core';
import {Colors, propTypesColors} from '../../types/generic';

import { getCircularProgressUtilityClass } from './circularProgressClasses';

import { 
  OverridableStringUnion, 
  InternalStandardProps as StandardProps 
} from '../../uprops';

import { mapThemeColor } from '../../hooks';

import { CircularProgressClasses, CircularProgressClassKey } from './circularProgressClasses';

export interface CircularProgressPropsColorOverrides {}

export interface CircularProgressProps
  extends StandardProps<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CircularProgressClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: OverridableStringUnion<
    Colors | 'inherit',
    CircularProgressPropsColorOverrides
  >;
  /**
   * If `true`, the shrink animation is disabled.
   * This only works if variant is `indeterminate`.
   * @default false
   */
  disableShrink?: boolean;
  /**
   * The size of the component.
   * If using a number, the pixel unit is assumed.
   * If using a string, you need to provide the CSS unit, for example '3rem'.
   * @default 40
   */
  size?: number | string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The thickness of the circle.
   * @default 3.6
   */
  thickness?: number;
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value?: number;
  /**
   * The variant to use.
   * Use indeterminate when there is no progress value.
   * @default 'indeterminate'
   */
  variant?: 'determinate' | 'indeterminate';
}


const SIZE = 44;

const circularRotateKeyframe = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

const circularDashKeyframe = keyframes`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`;

// This implementation is for supporting both Styled-components v4+ and Pigment CSS.
// A global animation has to be created here for Styled-components v4+ (https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#12).
// which can be done by checking typeof indeterminate1Keyframe !== 'string' (at runtime, Pigment CSS transform keyframes`` to a string).
const rotateAnimation =
  typeof circularRotateKeyframe !== 'string'
    ? css`
        animation: ${circularRotateKeyframe} 1.4s linear infinite;
      `
    : null;

const dashAnimation =
  typeof circularDashKeyframe !== 'string'
    ? css`
        animation: ${circularDashKeyframe} 1.4s ease-in-out infinite;
      `
    : null;

const useUtilityClasses = (ownerState:any) => {
  const { classes, variant, color, disableShrink } = ownerState;

  const slots = {
    root: ['root', variant, `color${capitalize(color)}`],
    svg: ['svg'],
    circle: ['circle', `circle${capitalize(variant)}`, disableShrink && 'circleDisableShrink'],
  };

  return composeClasses(slots, getCircularProgressUtilityClass, classes);
};

const CircularProgressRoot = styled('span', {
  name: 'MuiCircularProgress',
  slot: 'Root',
  overridesResolver: (props:any, styles:any) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(({ theme }:any) => ({
  display: 'inline-block',
  color: 'var(--progress-color)',
  variants: [
    {
      props: {
        variant: 'determinate',
      },
      style: {
        transition: theme.transitions.create('transform'),
      },
    },
    {
      props: {
        variant: 'indeterminate',
      },
      style: rotateAnimation || {
        animation: `${circularRotateKeyframe} 1.4s linear infinite`,
      },
    },
  ],
}));

const CircularProgressSVG = styled('svg', {
  name: 'MuxCircularProgress',
  slot: 'Svg',
  overridesResolver: (props:any, styles:any) => styles.svg,
})({
  display: 'block', // Keeps the progress centered
});

const CircularProgressCircle = styled('circle', {
  name: 'MuxCircularProgress',
  slot: 'Circle',
  overridesResolver: (props:any, styles:any) => {
    const { ownerState } = props;

    return [
      styles.circle,
      styles[`circle${capitalize(ownerState.variant)}`],
      ownerState.disableShrink && styles.circleDisableShrink,
    ];
  },
})(({ theme }:any) => ({
  stroke: 'currentColor',
  variants: [
    {
      props: {
        variant: 'determinate',
      },
      style: {
        transition: theme.transitions.create('stroke-dashoffset'),
      },
    },
    {
      props: {
        variant: 'indeterminate',
      },
      style: {
        // Some default value that looks fine waiting for the animation to kicks in.
        strokeDasharray: '80px, 200px',
        strokeDashoffset: 0, // Add the unit to fix a Edge 16 and below bug.
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.variant === 'indeterminate' && !ownerState.disableShrink,
      style: dashAnimation || {
        // At runtime for Pigment CSS, `bufferAnimation` will be null and the generated keyframe will be used.
        animation: `${circularDashKeyframe} 1.4s ease-in-out infinite`,
      },
    },
  ],
}));

/**
 * ## ARIA
 *
 * If the progress bar is describing the loading progress of a particular region of a page,
 * you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
 * attribute to `true` on that region until it has finished loading.
 */
export const CircularProgress = React.forwardRef<HTMLElement, CircularProgressProps>(function CircularProgress(inProps, ref) {
  const props = useMuiDefaultProps({ props: inProps, name: 'MuxCircularProgress' }) as CircularProgressProps;
  const {
    className,
    color = 'primary',
    disableShrink = false,
    size = 40,
    style,
    thickness = 3.6,
    value = 0,
    variant = 'indeterminate',
    ...other
  } = props;
  
  const themeColor = mapThemeColor(color);
  const hasThemeColor = themeColor && propTypesColors.includes(themeColor);

  const ownerState = {
    ...props,
    color:themeColor,
    disableShrink,
    size,
    thickness,
    value,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const circleStyle:any = {};
  const rootStyle:any = {};
  const rootProps:any = {};

  if (variant === 'determinate') {
    const circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
    circleStyle.strokeDasharray = circumference.toFixed(3);
    circleStyle.strokeDashoffset = `${(((100 - value) / 100) * circumference).toFixed(3)}px`;
    rootProps['aria-valuenow'] = Math.round(value);
    
    rootStyle.transform = 'rotate(-90deg)';
  }

  
  return (
    <CircularProgressRoot
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={ref}
      role="progressbar"
      {...rootProps}
      {...other}
      style={{
        '--progress-color': hasThemeColor ? `var(--tw-${themeColor})` :  themeColor,
        width: size, 
        height: size, 
        ...rootStyle, 
        ...style
      }}
    >
      <CircularProgressSVG
        className={classes.svg}
        ownerState={ownerState}
        viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}
      >
        <CircularProgressCircle
          className={classes.circle}
          style={circleStyle}
          ownerState={ownerState}
          cx={SIZE}
          cy={SIZE}
          r={(SIZE - thickness) / 2}
          fill="none"
          strokeWidth={thickness}
        />
      </CircularProgressSVG>
    </CircularProgressRoot>
  );
});


CircularProgress.displayName = "Mux.CircularProgress";

export type {  
  CircularProgressClassKey,
  CircularProgressClasses
}

export default CircularProgress;