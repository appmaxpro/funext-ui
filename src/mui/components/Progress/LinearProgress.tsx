import React from "react";
import Color from 'color';

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
  color,
  size,
  value,
  label,
  barProps,
  className,
  
} from "../../types/components/progress";

import { mapThemeColor } from "../../hooks";
import { 
  getLinearProgressUtilityClass, 
  LinearProgressClasses,  
  LinearProgressClassKey
} from './linearProgressClasses';

import { 
  keyframes, 
  css, 
  styled,  
  clsx, 
  composeClasses, 
  useMuiDefaultProps,
  SxThemeProps,
  type Theme
} from '../../styles';

import {capitalize} from '../../utils/core';
import {Colors, propTypesColors} from '../../types/generic';
import { 
  OverridableStringUnion, 
  InternalStandardProps as StandardProps 
} from '../../uprops';
import { isRTL } from "../../utils";

const TRANSITION_DURATION = 4; // seconds
const indeterminate1Keyframe = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`;

// This implementation is for supporting both Styled-components v4+ and Pigment CSS.
// A global animation has to be created here for Styled-components v4+ (https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#12).
// which can be done by checking typeof indeterminate1Keyframe !== 'string' (at runtime, Pigment CSS transform keyframes`` to a string).
const indeterminate1Animation =
  typeof indeterminate1Keyframe !== 'string'
    ? css`
        animation: ${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      `
    : null;

const indeterminate2Keyframe = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`;
const indeterminate2Animation =
  typeof indeterminate2Keyframe !== 'string'
    ? css`
        animation: ${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      `
    : null;

const bufferKeyframe = keyframes`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`;
const bufferAnimation =
  typeof bufferKeyframe !== 'string'
    ? css`
        animation: ${bufferKeyframe} 3s infinite linear;
      `
    : null;

const useUtilityClasses = (ownerState:any) => {
  const { classes, variant, color } = ownerState;

  const slots = {
    root: ['root', `color${capitalize(color)}`, variant],
    dashed: ['dashed', `dashedColor${capitalize(color)}`],
    bar1: [
      'bar',
      `barColor${capitalize(color)}`,
      (variant === 'indeterminate' || variant === 'query') && 'bar1Indeterminate',
      variant === 'determinate' && 'bar1Determinate',
      variant === 'buffer' && 'bar1Buffer',
    ],
    bar2: [
      'bar',
      variant !== 'buffer' && `barColor${capitalize(color)}`,
      variant === 'buffer' && `color${capitalize(color)}`,
      (variant === 'indeterminate' || variant === 'query') && 'bar2Indeterminate',
      variant === 'buffer' && 'bar2Buffer',
    ],
  };

  return composeClasses(slots, getLinearProgressUtilityClass, classes);
};

const LinearProgressRoot = styled('span', {
  name: 'MuxLinearProgress',
  slot: 'Root',
  overridesResolver: (props:any, styles:any) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[`color${capitalize(ownerState.color)}`],
      styles[ownerState.variant],
    ];
  },
})(({ theme }:{theme:Theme,[key:string]: any}) => ({
  position: 'relative',
  overflow: 'hidden',
  display: 'block',
  height: 4,
  backgroundColor: 'var(--progress-bg, inherit)',
  // Fix Safari's bug during composition of different paint.
  zIndex: 0,
  '@media print': {
    colorAdjust: 'exact',
  },
  variants: [
    {
      props: ({ ownerState }:any) => ownerState.color === 'inherit' && ownerState.variant !== 'buffer',
      style: {
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'currentColor',
          opacity: 0.3,
        },
      },
    },
    {
      props: { variant: 'buffer' },
      style: { backgroundColor: 'transparent' },
    },
    {
      props: { variant: 'query' },
      style: { transform: 'rotate(180deg)' },
    },

  ],
}));

const LinearProgressDashed = styled('span', {
  name: 'MuxLinearProgress',
  slot: 'Dashed',
  overridesResolver: (props:any, styles:any) => {
    const { ownerState } = props;
    return [styles.dashed, styles[`dashed-color-${ownerState.color}`]];
  },
})(
  ({ theme }:{theme:Theme}) => ({
    position: 'absolute',
    marginTop: 0,
    height: '100%',
    width: '100%',
    backgroundSize: '10px 10px',
    backgroundPosition: '0 -23px',
    backgroundImage: `radial-gradient(var(--progress-color) 0%, var(--progress-color) 16%, transparent 42%)`,
    variants: [
      {
        props: { color: 'inherit' },
        style: {
          opacity: 0.3,
          backgroundImage: `radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)`,
        },
      },
    ],
  }),
  bufferAnimation || {
    // At runtime for Pigment CSS, `bufferAnimation` will be null and the generated keyframe will be used.
    animation: `${bufferKeyframe} 3s infinite linear`,
  },
);

const LinearProgressBar1 = styled('span', {
  name: 'MuxLinearProgress',
  slot: 'Bar1',
  overridesResolver: (props:any, styles:any) => {
    const { ownerState } = props;

    return [
      styles.bar,
      styles[`bar-color-${ownerState.color}`],
      (ownerState.variant === 'indeterminate' || ownerState.variant === 'query') &&
        styles.bar1Indeterminate,
      ownerState.variant === 'determinate' && styles.bar1Determinate,
      ownerState.variant === 'buffer' && styles.bar1Buffer,
      ownerState.variant === 'striped',
    ];
  },
})((props:any) => ({
  width: '100%',
  position: 'absolute',
  left: 0,
  bottom: 0,
  top: 0,
  transition: 'transform 0.2s linear',
  transformOrigin: 'left',
  backgroundColor: 'var(--progress-color)',
  variants: [
    {
      props: {
        color: 'inherit',
      },
      style: {
        backgroundColor: 'currentColor',
      },
    },
    {
      props: {
        variant: 'determinate',
      },
      style: {
        transition: `transform .${TRANSITION_DURATION}s linear`,
      },
    },
    {
      props: {
        variant: 'buffer',
      },
      style: {
        zIndex: 1,
        transition: `transform .${TRANSITION_DURATION}s linear`,
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.variant === 'indeterminate' || ownerState.variant === 'query',
      style: {
        width: 'auto',
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.variant === 'indeterminate' || ownerState.variant === 'query',
      style: indeterminate1Animation || {
        animation: `${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`,
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.variant === 'striped',
      style: {
        backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)',
        backgroundSize: '1rem'
      },
    },
  ],
}));

const LinearProgressBar2 = styled('span', {
  name: 'MuxLinearProgress',
  slot: 'Bar2',
  overridesResolver: (props:any, styles:any) => {
    const { ownerState } = props;

    return [
      styles.bar,
      styles[`bar-color${ownerState.color}`],
      (ownerState.variant === 'indeterminate' || ownerState.variant === 'query') &&
        styles.bar2Indeterminate,
      ownerState.variant === 'buffer' && styles.bar2Buffer,
    ];
  },
})(({ theme }: {theme:Theme}) => ({
  width: '100%',
  position: 'absolute',
  left: 0,
  bottom: 0,
  top: 0,
  transition: 'transform 0.2s linear',
  transformOrigin: 'left',
  variants: [
    {
      props: ({ ownerState }:any) => ownerState.variant !== 'buffer' 
      && ownerState.color !== 'inherit',
      style: {
        backgroundColor: 'var(--progress-color2, currentColor)',
      },
    },
    {
      props: {
        color: 'inherit',
      },
      style: {
        opacity: 0.3,
      },
    },
    {
      props: {
        variant: 'striped',
      },
      style: {
        display: 'none',
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.variant === 'indeterminate' || ownerState.variant === 'query',
      style: {
        width: 'auto',
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.variant === 'indeterminate' || ownerState.variant === 'query',
      style: indeterminate2Animation || {
        animation: `${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`,
      },
    },
    
  ],
}));


export interface LinearProgressPropsColorOverrides {}

export interface LinearProgressProps
  extends StandardProps<React.HTMLAttributes<HTMLSpanElement>, 'children'> {

  barProps?: {
    [key: string]: any;
  };
  label?: label;
  size?: "sm" | "md" | "lg"
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<LinearProgressClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: OverridableStringUnion<
    Colors | 'inherit',
    LinearProgressPropsColorOverrides
  >;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value?: number;
  /**
   * The value for the buffer variant.
   * Value between 0 and 100.
   */
  valueBuffer?: number;
  /**
   * The variant to use.
   * Use indeterminate or query when there is no progress value.
   * @default 'indeterminate'
   */
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query' | 'striped';

}

const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  (inProps, ref) => {
    
    const props = useMuiDefaultProps({ props: inProps, name: 'MuiLinearProgress' });
    const { progress } = useTailwindTheme();
    const { defaultProps, valid, styles } = progress;
    const { base, variants, sizes } = styles;

    const {
      className,
      color = 'primary',
      value,
      valueBuffer,
      variant = 'indeterminate',
      label,
      size = defaultProps.size,
      barProps = defaultProps.barProps,
      ...other
    } = props;

    const ownerState = {
      ...props,
      color: mapThemeColor(color),
      variant,
    };
    
    const hasThemeColor = propTypesColors.includes(ownerState.color as string);
    
    const classes = useUtilityClasses(ownerState);

    const isRtl = isRTL(document.documentElement);
  
    const rootProps:any = {};
    const inlineStyles:any = { bar1: {}, bar2: {} };
  
    if (variant === 'determinate' || variant === 'buffer' || variant === 'striped') {
      if (value !== undefined) {
        rootProps['aria-valuenow'] = Math.round(value);
        rootProps['aria-valuemin'] = 0;
        rootProps['aria-valuemax'] = 100;
        let transform = value - 100;
        if (isRtl) {
          transform = -transform;
        }
        inlineStyles.bar1.transform = `translateX(${transform}%)`;
      } else if (process.env.NODE_ENV !== 'production') {
        console.error(
          'MUI: You need to provide a value prop ' +
            'when using the determinate or buffer variant of LinearProgress .',
        );
      }
    }
    if (variant === 'buffer') {
      if (valueBuffer !== undefined) {
        let transform = (valueBuffer || 0) - 100;
        if (isRtl) {
          transform = -transform;
        }
        inlineStyles.bar2.transform = `translateX(${transform}%)`;
      } else if (process.env.NODE_ENV !== 'production') {
        console.error(
          'MUI: You need to provide a valueBuffer prop ' +
            'when using the buffer variant of LinearProgress.',
        );
      }
    }

    const progressContainerSize = objectsToString(
      sizes[findMatch(valid.sizes, size, "md")]["container"]["initial"],
    );
    const progressContainer = classnames(
      objectsToString(base.container.initial),
      progressContainerSize,
    );
    const progressWithLabelSize = objectsToString(
      sizes[findMatch(valid.sizes, size, "md")]["container"]["withLabel"],
    );
    const progressWithLabel = classnames(
      objectsToString(base.container.withLabel),
      progressWithLabelSize,
    );

    const progressBarSize = objectsToString(sizes[findMatch(valid.sizes, size, "md")]["bar"]);
    
    const progressBar = objectsToString(base.bar);
    
    const containerClasses = twMerge(
      clsx(classes.root, progressContainer, { [progressWithLabel]: label }),
      className,
    );
    const barClasses = twMerge("w-full", clsx(progressBar, progressBarSize, barProps?.className));
    return (
      <LinearProgressRoot
        className={containerClasses}
        ownerState={ownerState}
        role="progressbar"
        {...rootProps}
        ref={ref}
        {...other}
        style={{
          '--progress-bg': hasThemeColor ? `rgb(var(--tw-${ownerState.color}-rgb / 40%))`: `var(--tw-hd-sm)`,
          '--progress-color': hasThemeColor ? `var(--tw-${ownerState.color})` :  ownerState.color,
          '--progress-color2': hasThemeColor ? `var(--tw-${ownerState.color}-900)` :  ownerState.color,
          ...other.style
        }}
      >
        {variant === 'buffer' ? (
          <LinearProgressDashed className={classes.dashed} ownerState={ownerState} />
        ) : null}
        <LinearProgressBar1
          className={classes.bar1}
          ownerState={ownerState}
          style={inlineStyles.bar1}>
            
        </LinearProgressBar1>    
        {variant === 'determinate' ? null : (
          <LinearProgressBar2
            className={classes.bar2}
            ownerState={ownerState}
            style={inlineStyles.bar2}
          />
        )}
        {label 
                ? <span className={barClasses}>
                    <span className={`bg-${ownerState.color} text-${ownerState.color}-50`}>{`${value}% `} {typeof label === "string" ? label: ""}</span>
                  </span> 
                : ""
              }
      </LinearProgressRoot>
    );
  }   
);

LinearProgress.displayName = "Mux.Progress";

export type{
  LinearProgressClasses,  
  LinearProgressClassKey,
  
} 
export {
  LinearProgress
}

export default LinearProgress;
