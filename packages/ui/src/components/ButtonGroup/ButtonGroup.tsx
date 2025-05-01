// @ts-nocheck
'use client';
import * as React from 'react';
import getValidReactChildren from '@mui/utils/getValidReactChildren';
import { 
  styled, 
  memoTheme, 
  useMuxDefaultProps ,
  alpha,
  composeClasses,
  clsx
}from '../../styles';
import ButtonGroupProps, { getButtonGroupUtilityClass, buttonGroupClasses } from './types';
import ButtonGroupContext, {ButtonGroupButtonContext} from './ButtonGroupContext';

import { capitalize } from '../../utils';

export * from './types';

const overridesResolver = (props:any, styles:any) => {
  const { ownerState } = props;

  return [
    { [`& .${buttonGroupClasses.grouped}`]: styles.grouped },
    {
      [`& .${buttonGroupClasses.grouped}`]: styles[`grouped${capitalize(ownerState.orientation)}`],
    },
    { [`& .${buttonGroupClasses.grouped}`]: styles[`grouped${capitalize(ownerState.variant)}`] },
    {
      [`& .${buttonGroupClasses.grouped}`]:
        styles[`grouped${capitalize(ownerState.variant)}${capitalize(ownerState.orientation)}`],
    },
    {
      [`& .${buttonGroupClasses.grouped}`]:
        styles[`grouped${capitalize(ownerState.variant)}${capitalize(ownerState.color)}`],
    },
    {
      [`& .${buttonGroupClasses.firstButton}`]: styles.firstButton,
    },
    {
      [`& .${buttonGroupClasses.lastButton}`]: styles.lastButton,
    },
    {
      [`& .${buttonGroupClasses.middleButton}`]: styles.middleButton,
    },
    styles.root,
    styles[ownerState.variant],
    ownerState.disableElevation === true && styles.disableElevation,
    ownerState.fullWidth && styles.fullWidth,
    ownerState.orientation === 'vertical' && styles.vertical,
  ];
};

const useUtilityClasses = (ownerState:any) => {
  const { classes, color, disabled, disableElevation, fullWidth, orientation, variant } =
    ownerState;

  const slots = {
    root: [
      'root',
      variant,
      orientation,
      fullWidth && 'fullWidth',
      disableElevation && 'disableElevation',
      `color${capitalize(color)}`,
    ],
    grouped: [
      'grouped',
      `grouped${capitalize(orientation)}`,
      `grouped${capitalize(variant)}`,
      `grouped${capitalize(variant)}${capitalize(orientation)}`,
      `grouped${capitalize(variant)}${capitalize(color)}`,
      disabled && 'disabled',
    ],
    firstButton: ['firstButton'],
    lastButton: ['lastButton'],
    middleButton: ['middleButton'],
  };

  return composeClasses(slots, getButtonGroupUtilityClass, classes);
};

const ButtonGroupRoot = styled('div', {
  name: 'MuxButtonGroup',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'inline-flex',
    borderRadius: (theme.vars || theme).shape.borderRadius,
    variants: [
      {
        props: { variant: 'filled' },
        style: {
          boxShadow: (theme.vars || theme).shadows[2],
        },
      },
      {
        props: { disableElevation: true },
        style: {
          boxShadow: 'none',
        },
      },
      {
        props: { fullWidth: true },
        style: {
          width: '100%',
        },
      },
      {
        props: { orientation: 'vertical' },
        style: {
          flexDirection: 'column',
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
          },
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
          },
        },
      },
      {
        props: { orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          },
        },
      },
      {
        props: { variant: 'text', orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderRight: theme.vars
              ? `1px solid rgba(${theme.vars.palette.common.onBackgroundChannel} / 0.23)`
              : `1px solid ${
                  theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)'
                }`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderRight: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      {
        props: { variant: 'text', orientation: 'vertical' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottom: theme.vars
              ? `1px solid rgba(${theme.vars.palette.common.onBackgroundChannel} / 0.23)`
              : `1px solid ${
                  theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)'
                }`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      ...Object.entries(theme.palette)
        .filter(([, value]) => value && value.main)
        .flatMap(([color]) => [
          {
            props: { variant: 'text', color },
            style: {
              [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
                borderColor: theme.vars
                  ? `rgba(${theme.vars.palette[color].mainChannel} / 0.5)`
                  : alpha(theme.palette[color].main, 0.5),
              },
            },
          },
        ]),

      {
        props: { variant: 'outlined', orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderRightColor: 'transparent',
            '&:hover': {
              borderRightColor: 'currentColor',
            },
          },
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            marginLeft: -1,
          },
        },
      },
      {
        props: { variant: 'outlined', orientation: 'vertical' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottomColor: 'transparent',
            '&:hover': {
              borderBottomColor: 'currentColor',
            },
          },
          [`& .${buttonGroupClasses.lastButton},& .${buttonGroupClasses.middleButton}`]: {
            marginTop: -1,
          },
        },
      },
      {
        props: { variant: 'filled', orientation: 'horizontal' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderRight: `1px solid ${(theme.vars || theme).palette.grey[400]}`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderRight: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      {
        props: { variant: 'filled', orientation: 'vertical' },
        style: {
          [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
            borderBottom: `1px solid ${(theme.vars || theme).palette.grey[400]}`,
            [`&.${buttonGroupClasses.disabled}`]: {
              borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
            },
          },
        },
      },
      ...Object.entries(theme.palette)
        .filter(([, value]) => value && value.dark)
        .map(([color]) => ({
          props: { variant: 'filled', color },
          style: {
            [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
              borderColor: (theme.vars || theme).palette[color].dark,
            },
          },
        })),

        {
          props: { variant: 'ghost', orientation: 'horizontal' },
          style: {
            [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
              borderRight: theme.vars
                ? `1px solid rgba(${theme.vars.palette.common.onBackgroundChannel} / 0.23)`
                : `1px solid ${
                    theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.23)'
                      : 'rgba(255, 255, 255, 0.23)'
                  }`,
              [`&.${buttonGroupClasses.disabled}`]: {
                borderRight: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
              },
            },
          },
        },
        {
          props: { variant: 'ghost', orientation: 'vertical' },
          style: {
            [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
              borderBottom: theme.vars
                ? `1px solid rgba(${theme.vars.palette.common.onBackgroundChannel} / 0.23)`
                : `1px solid ${
                    theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.23)'
                      : 'rgba(255, 255, 255, 0.23)'
                  }`,
              [`&.${buttonGroupClasses.disabled}`]: {
                borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabled}`,
              },
            },
          },
        },
        ...Object.entries(theme.palette)
          .filter(([, value]) => value && value.main)
          .flatMap(([color]) => [
            {
              props: { variant: 'ghost', color },
              style: {
                [`& .${buttonGroupClasses.firstButton},& .${buttonGroupClasses.middleButton}`]: {
                  borderColor: (theme.vars || theme).palette[color].main,
                },
              },
            },
          ]),
    ],
    [`& .${buttonGroupClasses.grouped}`]: {
      minWidth: 40,
      boxShadow: 'none',
      props: { variant: 'filled' },
      style: {
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  })),
);

export const ButtonGroup = React.forwardRef<HTMLElement, ButtonGroupProps>(function ButtonGroup(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxButtonGroup' });
  const {
    children,
    className,
    color = 'primary',
    component = 'div',
    disabled = false,
    disableElevation = false,
    focusRipple = true,
    ripple = true,
    fullWidth = false,
    vertical,
    orientation = vertical ? 'vertical' : 'horizontal',
    size = 'md',
    variant = 'outlined',
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
    component,
    disabled,
    disableElevation,
    focusRipple,
    ripple,
    fullWidth,
    orientation,
    size,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const context = React.useMemo(
    () => ({
      className: classes.grouped,
      color,
      disabled,
      disableElevation,
      focusRipple,
      ripple,
      fullWidth,
      size,
      variant,
    }),
    [
      color,
      disabled,
      disableElevation,
      focusRipple,
      ripple,
      fullWidth,
      size,
      variant,
      classes.grouped,
    ],
  );

  const validChildren = getValidReactChildren(children);
  const childrenCount = validChildren.length;

  const getButtonPositionClassName = (index:number) => {
    const isFirstButton = index === 0;
    const isLastButton = index === childrenCount - 1;

    if (isFirstButton && isLastButton) {
      return '';
    }
    if (isFirstButton) {
      return classes.firstButton;
    }
    if (isLastButton) {
      return classes.lastButton;
    }
    return classes.middleButton;
  };

  return (
    <ButtonGroupRoot
      as={component}
      role="group"
      className={clsx(classes.root, className)}
      ref={ref as any}
      ownerState={ownerState}
      {...other}
    >
      <ButtonGroupContext.Provider value={context}>
        {validChildren.map((child, index) => {
          return (
            <ButtonGroupButtonContext.Provider
              key={index}
              value={getButtonPositionClassName(index)}
            >
              {child}
            </ButtonGroupButtonContext.Provider>
          );
        })}
      </ButtonGroupContext.Provider>
    </ButtonGroupRoot>
  );
});

export * from './types';
export * from './ButtonGroupContext';

export default ButtonGroup;