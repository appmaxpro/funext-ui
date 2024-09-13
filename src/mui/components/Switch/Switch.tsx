'use client';
// @inheritedComponent IconButton
import * as React from 'react';
import { alpha, darken, lighten } from '@mui/system/colorManipulator';

import SwitchBase, {type SwitchBaseProps} from '../internal/SwitchBase';

import { 
  styled, 
  memoTheme, 
  useMuiDefaultProps, 
  clsx, 
  composeClasses,
  generateUtilityClasses,
  generateUtilityClass,
  SxThemeProps
} from '../../styles';
import { capitalize } from '../../utils';
import {
  OverridableStringUnion, 
  StandardProps
} from '../../props';

export interface SwitchClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `edge="start"`. */
  edgeStart: string;
  /** Styles applied to the root element if `edge="end"`. */
  edgeEnd: string;
  /** Styles applied to the internal `SwitchBase` component's `root` class. */
  switchBase: string;
  /** Styles applied to the internal SwitchBase component's root element if `color="primary"`. */
  colorPrimary: string;
  /** Styles applied to the internal SwitchBase component's root element if `color="secondary"`. */
  colorSecondary: string;
  /** Styles applied to the root element if `size="small"`. */
  sizeSmall: string;
  /** Styles applied to the root element if `size="medium"`. */
  sizeMedium: string;
  /** State class applied to the internal `SwitchBase` component's `checked` class. */
  checked: string;
  /** State class applied to the internal SwitchBase component's disabled class. */
  disabled: string;
  /** Styles applied to the internal SwitchBase component's input element. */
  input: string;
  /** Styles used to create the thumb passed to the internal `SwitchBase` component `icon` prop. */
  thumb: string;
  /** Styles applied to the track element. */
  track: string;
}

export type SwitchClassKey = keyof SwitchClasses;

export function getSwitchUtilityClass(slot: string): string {
  return generateUtilityClass('MuxSwitch', slot);
}

const switchClasses: SwitchClasses = generateUtilityClasses('MuxSwitch', [
  'root',
  'edgeStart',
  'edgeEnd',
  'switchBase',
  'colorPrimary',
  'colorSecondary',
  'sizeSmall',
  'sizeMedium',
  'checked',
  'disabled',
  'input',
  'thumb',
  'track',
]);



const useUtilityClasses = (ownerState:any) => {
  const { classes, edge, size, color, checked, disabled } = ownerState;

  const slots = {
    root: ['root', edge && `edge${capitalize(edge)}`, `size${capitalize(size)}`],
    switchBase: [
      'switchBase',
      `color${capitalize(color)}`,
      checked && 'checked',
      disabled && 'disabled',
    ],
    thumb: ['thumb'],
    track: ['track'],
    input: ['input'],
  };

  const composedClasses = composeClasses(slots, getSwitchUtilityClass, classes);

  return {
    ...classes, // forward the disabled and checked classes to the SwitchBase
    ...composedClasses,
  };
};

const SwitchRoot = styled('span', {
  name: 'MuxSwitch',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.edge && styles[`edge${capitalize(ownerState.edge)}`],
      styles[`size${capitalize(ownerState.size)}`],
    ];
  },
})({
  display: 'inline-flex',
  width: 34 + 12 * 2,
  height: 14 + 12 * 2,
  overflow: 'hidden',
  padding: 12,
  boxSizing: 'border-box',
  position: 'relative',
  flexShrink: 0,
  zIndex: 0, // Reset the stacking context.
  verticalAlign: 'middle', // For correct alignment with the text.
  '@media print': {
    colorAdjust: 'exact',
  },
  variants: [
    {
      props: { edge: 'start' },
      style: { marginLeft: -8 },
    },
    {
      props: { edge: 'end' },
      style: { marginRight: -8 },
    },
    {
      props: { size: 'sm' },
      style: {
        width: 40,
        height: 24,
        padding: 7,
        [`& .${switchClasses.thumb}`]: {
          width: 16,
          height: 16,
        },
        [`& .${switchClasses.switchBase}`]: {
          padding: 4,
          [`&.${switchClasses.checked}`]: {
            transform: 'translateX(16px)',
          },
        },
      },
    },
  ],
});

const SwitchSwitchBase = styled(SwitchBase, {
  name: 'MuxSwitch',
  slot: 'SwitchBase',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.switchBase,
      { [`& .${switchClasses.input}`]: styles.input },
      ownerState.color !== 'default' && styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1, // Render above the focus ripple.
    color: theme.vars
      ? theme.vars.palette.Switch.defaultColor
      : `${theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey[300]}`,
    transition: theme.transitions.create(['left', 'transform'], {
      duration: theme.transitions.duration.shortest,
    }),
    [`&.${switchClasses.checked}`]: {
      transform: 'translateX(20px)',
    },
    [`&.${switchClasses.disabled}`]: {
      color: theme.vars
        ? theme.vars.palette.Switch.defaultDisabledColor
        : `${theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]}`,
    },
    [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
      opacity: 0.5,
    },
    [`&.${switchClasses.disabled} + .${switchClasses.track}`]: {
      opacity: theme.vars
        ? theme.vars.opacity.switchTrackDisabled
        : `${theme.palette.mode === 'light' ? 0.12 : 0.2}`,
    },
    [`& .${switchClasses.input}`]: {
      left: '-100%',
      width: '300%',
    },
  })),
  memoTheme(({ theme }) => ({
    '&:hover': {
      backgroundColor: theme.vars
        ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})`
        : alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    variants: [
      ...Object.entries(theme.palette)
        .filter(([, value]) => value && value.main && value.light) // check all the used fields in the style below
        .map(([color]) => ({
          props: { color },
          style: {
            [`&.${switchClasses.checked}`]: {
              color: (theme.vars || theme).palette[color].main,
              '&:hover': {
                backgroundColor: theme.vars
                  ? `rgba(${theme.vars.palette[color].mainChannel} / ${theme.vars.palette.action.hoverOpacity})`
                  : alpha(theme.palette[color].main, theme.palette.action.hoverOpacity),
                '@media (hover: none)': {
                  backgroundColor: 'transparent',
                },
              },
              [`&.${switchClasses.disabled}`]: {
                color: theme.vars
                  ? theme.vars.palette.Switch[`${color}DisabledColor`]
                  : `${
                      theme.palette.mode === 'light'
                        ? lighten(theme.palette[color].main, 0.62)
                        : darken(theme.palette[color].main, 0.55)
                    }`,
              },
            },
            [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
              backgroundColor: (theme.vars || theme).palette[color].main,
            },
          },
        })),
    ],
  })),
);

const SwitchTrack = styled('span', {
  name: 'MuxSwitch',
  slot: 'Track',
  overridesResolver: (props, styles) => styles.track,
})(
  memoTheme(({ theme }) => ({
    height: '100%',
    width: '100%',
    borderRadius: 14 / 2,
    zIndex: -1,
    transition: theme.transitions.create(['opacity', 'background-color'], {
      duration: theme.transitions.duration.shortest,
    }),
    backgroundColor: theme.vars
      ? theme.vars.palette.common.onBackground
      : `${theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white}`,
    opacity: theme.vars
      ? theme.vars.opacity.switchTrack
      : `${theme.palette.mode === 'light' ? 0.38 : 0.3}`,
  })),
);

const SwitchThumb = styled('span', {
  name: 'MuxSwitch',
  slot: 'Thumb',
  overridesResolver: (props, styles) => styles.thumb,
})(
  memoTheme(({ theme }) => ({
    boxShadow: (theme.vars || theme).shadows[1],
    backgroundColor: 'currentColor',
    width: 20,
    height: 20,
    borderRadius: '50%',
  })),
);


export interface SwitchPropsSizeOverrides {}

export interface SwitchPropsColorOverrides {}

export interface SwitchProps
  extends StandardProps<SwitchBaseProps, SwitchClassKey, 'checkedIcon' | 'color' | 'icon'> {
  /**
   * The icon to display when the component is checked.
   */
  checkedIcon?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<SwitchClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: OverridableStringUnion<
    'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default',
    SwitchPropsColorOverrides
  >;
  /**
   * If `true`, the component is disabled.
   */
  disabled?: boolean;
  /**
   * The icon to display when the component is unchecked.
   */
  icon?: React.ReactNode;
  /**
   * The size of the component.
   * `small` is equivalent to the dense switch styling.
   * @default 'medium'
   */
  size?: OverridableStringUnion<'sm' | 'lg', SwitchPropsSizeOverrides>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The value of the component. The DOM API casts this to a string.
   * The browser uses "on" as the default value.
   */
  value?: unknown;
}

const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(inProps, ref) {
  const props = useMuiDefaultProps({ props: inProps, name: 'MuxSwitch' });
  const { className, color = 'primary', edge = false, size = 'lg', sx, ...other } = props;

  const ownerState = {
    ...props,
    color,
    edge,
    size,
  };

  const classes = useUtilityClasses(ownerState);
  const icon = <SwitchThumb className={classes.thumb} ownerState={ownerState} />;

  return (
    <SwitchRoot className={clsx(classes.root, className)} sx={sx} ownerState={ownerState}>
      <SwitchSwitchBase
        type="checkbox"
        icon={icon}
        checkedIcon={icon}
        ref={ref}
        ownerState={ownerState}
        {...other}
        classes={{
          ...classes,
          root: classes.switchBase,
        }}
      />
      <SwitchTrack className={classes.track} ownerState={ownerState} />
    </SwitchRoot>
  );
});


export default Switch;