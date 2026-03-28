// @ts-nocheck

import * as React from 'react';
import resolveProps from '@mui/utils/resolveProps';
import { 
  styled ,
  memoTheme,
  useMuxDefaultProps,
  clsx,
  composeClasses,
  alpha,
  lighten,
  useTailwindTheme,
  Theme
} from '../../styles';
import ButtonBase from './ButtonBase';

import { 
  getButtonUtilityClass, 
  buttonClasses,  
  type ButtonProps
} from './types';

import ButtonGroupContext, {ButtonGroupButtonContext} from '../ButtonGroup/ButtonGroupContext';
import { capitalize } from '../../utils';
import rootShouldForwardProp from '../../styles/rootShouldForwardProp';
import { mapThemeColor } from "../../hooks";


const useUtilityClasses = (ownerState:any) => {
  const { color, disableElevation, fullWidth, size, variant, classes, disable } = ownerState;

  const slots = {
    root: [
      'root',
      variant,
      `size${capitalize(size)}`,
      `color${capitalize(color)}`,
      (disableElevation && variant === 'filled' && 'disableElevation'),
      fullWidth && 'fullWidth',
      !disable && 'canHover'
    ],
    label: ['label'],
    startIcon: ['icon', 'startIcon', `iconSize${capitalize(size)}`],
    endIcon: ['icon', 'endIcon', `iconSize${capitalize(size)}`],
    midIcon: ['icon', 'midIcon', `iconSize${capitalize(size)}`],
  };

  const composedClasses = composeClasses(slots, getButtonUtilityClass, classes);

  return {
    ...classes, // forward the focused, disabled, etc. classes to the ButtonBase
    ...composedClasses,
  };
};


const commonIconStyles = [
  {
    props: { size: 'sm' },
    style: {
      '& svg': {
        fontSize: "1.125rem",
      },
    },
  },
  {
    props: { size: 'md' },
    style: {
      '& svg': {
        fontSize: "1.5rem",
      },
    },
  },
  {
    props: { size: 'lg' },
    style: {
      '& svg': {
        fontSize: "1.875rem",
      },
    },
  },
];

export const ButtonRoot = styled(ButtonBase, {
  name: 'MuxButton',
  slot: 'Root',
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      styles[`${ownerState.variant}${capitalize(ownerState.color)}`],
      styles[`size${capitalize(ownerState.size)}`],
      styles[`${ownerState.variant}Size${capitalize(ownerState.size)}`],
      ownerState.color === 'inherit' && styles.colorInherit,
      ownerState.disableElevation && styles.disableElevation,
      ownerState.fullWidth && styles.fullWidth,
    ];
  },
})(
  memoTheme(({ theme }:{theme:Theme}) => {
    const isLight = theme.palette.mode === 'light';
    const inheritFilledBackgroundColor =
    isLight ? lighten(theme.palette.slate[200], .5) : theme.palette.slate[800];

    const inheritFilledHoverBackgroundColor =
    isLight ? lighten(theme.palette.slate[300], .3) : theme.palette.slate[700];

    return {
      
      minWidth: 64,
      border: 0,
      borderRadius: theme.shape.borderRadius,
      outline: `2px solid transparent`,
      outlineOffset: 1,
      padding: '6px 16px',
      transition: 'box-shadow 600ms, border-color 250ms, color 250ms, opacity 250ms, outline 900ms, '+theme.transitions.create(
        'background-color',
        {
          duration: 550,
        },
      ),
      '&:hover': {
        textDecoration: 'none',
      },
      [`&.${buttonClasses.disabled}`]: {
        color: theme.palette.action.disabled,
      },
      [`&.${buttonClasses.focusVisible}`]: {
        outlineColor: `currentcolor`,
        outlineOffset: -2
      },
      variants: [
        {
          props: { button: 'button' },
          style: {
            ...theme.typography.button,
          }
        },

        {
          props: { variant: 'filled' },
          style: {
            color: `var(--button-filled-color)`,
            backgroundColor: `var(--button-filled-bg)`,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
              // Reset on touch devices, it doesn't add specificity
              '@media (hover: none)': {
                boxShadow: theme.shadows[2],
              },
            },
            '&:active': {
              boxShadow: theme.shadows[8],
            },
            [`&.${buttonClasses.focusVisible}`]: {
              boxShadow: theme.shadows[6],
            },
            [`&.${buttonClasses.disabled}`]: {
              color: theme.palette.action.disabled,
              boxShadow: theme.shadows[0],
              backgroundColor: theme.palette.action.disabledBackground,
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            border: '1px solid currentColor',
            borderColor: `var(--button-outlined-border, currentColor)`,
            backgroundColor: `var(--button-outlined-bg)`,
            color: `var(--button-outlined-color)`,
            [`&.${buttonClasses.disabled}`]: {
              border: `1px solid ${theme.palette.action.disabledBackground}`,
            },
          },
        },
        {
          props: { variant: 'text' },
          style: {
            color: `var(--button-text-color)`,
            backgroundColor: `var(--button-text-bg)`,
          },
        },
        {
          props: { variant: 'ghost' },
          style: (props) => {
            return {
              color: `var(--button-ghost-color)`,
              backgroundColor: `var(--button-ghost-bg)`,
            }},
        },
        ...Object.entries(theme.palette)
          .filter(([, palette]) => palette && palette.main && palette.dark && palette.contrastText)
          .map(([color]) => ({
            props: { color },
            style: {
              '--button-text-color': theme.palette[color].main,
              '--button-outlined-color': theme.palette[color].main,
              '--button-outlined-border': theme.vars
                ? `rgba(${theme.vars.palette[color].mainChannel} / 0.5)`
                : alpha(theme.palette[color].main, 0.5),
              '--button-filled-color': theme.palette[color].contrastText,
              '--button-filled-bg': theme.palette[color].main,
              '--button-ghost-color': theme.palette[color].dark,
              '--button-ghost-bg': lighten(theme.palette[color].light, 0.8),
              '@media (hover: hover)': {
                [`&.${buttonClasses.canHover}:hover`]: {
                  '--button-filled-bg': theme.palette[color].dark,
                  '--button-text-bg': theme.vars
                    ? `rgba(${theme.vars.palette[color].mainChannel} / ${theme.vars.palette.action.hoverOpacity})`
                    : alpha(theme.palette[color].main, theme.palette.action.hoverOpacity),
                  '--button-outlined-border': theme.palette[color].main,
                  '--button-outlined-bg': theme.vars
                    ? `rgba(${theme.vars.palette[color].mainChannel} / ${theme.vars.palette.action.hoverOpacity})`
                    : alpha(theme.palette[color].main, theme.palette.action.hoverOpacity),
                  '--button-ghost-bg': lighten(theme.palette[color].light, 0.6),
                },
              },
            },
          })),
        {
          props: {
            color: 'inherit',
          },
          style: {
            '--button-filled-color': theme.vars
              ? // this is safe because grey does not change between default light/dark mode
                theme.vars.palette.text.primary
              : theme.palette.getContrastText?.(inheritFilledBackgroundColor),
            '--button-filled-bg': theme.vars
              ? theme.vars.palette.Button.inheritFilledBg
              : inheritFilledBackgroundColor,
            '--button-ghost-color': theme.vars
                ? theme.vars.palette.text.primary
                : theme.palette.getContrastText?.(inheritFilledBackgroundColor),
            '--button-ghost-bg': theme.vars
                ? theme.vars.palette.Button.inheritFilledBg
                : inheritFilledBackgroundColor,  
            '--button-outlined-border': inheritFilledHoverBackgroundColor,
            '@media (hover: hover)': {
              [`&.${buttonClasses.canHover}:hover`]: {
                '--button-filled-bg': inheritFilledHoverBackgroundColor,
                '--button-ghost-bg': inheritFilledHoverBackgroundColor,
                '--button-text-bg': theme.vars
                  ? `rgba(${theme.vars.palette.text.primaryChannel} / ${theme.vars.palette.action.hoverOpacity})`
                  : alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
                '--button-outlined-bg': inheritFilledBackgroundColor,
                '--button-outlined-border': theme.vars
                  ? `rgba(${theme.vars.palette.text.primaryChannel} / ${theme.vars.palette.action.hoverOpacity})`
                  : alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
              },
            },
          },
        },
        {
          props: {
            size: 'sm',
          },
          style: {
            padding: '3px 6px',
            fontWeight: 'normal',
            letterSpacing: 0,
            borderRadius: theme.shape.borderRadius / 2,
            lineHeight: '20px'
          },
        },
        {
          props: {
            size: 'lg',
          },
          style: {
            padding: '8px 22px',
            fontSize: theme.typography.pxToRem(16),
            borderRadius: theme.shape.borderRadius * 1.2,
          },
        },
        {
          props: {
            disableElevation: true,
          },
          style: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
            [`&.${buttonClasses.focusVisible}`]: {
              boxShadow: 'none',
            },
            '&:active': {
              boxShadow: 'none',
            },
            [`&.${buttonClasses.disabled}`]: {
              boxShadow: 'none',
            },
          },
        },
        {
          props: { fullWidth: true },
          style: { width: '100%' },
        },
      ],
    };
  }),
);
export const ButtonMidIcon = styled('span', {
  name: 'MuxButton',
  slot: 'MidIcon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.midIcon, styles[`iconSize${capitalize(ownerState.size)}`]];
  },
})({
  display: 'inherit',
  variants: commonIconStyles
});

export const ButtonStartIcon = styled('span', {
  name: 'MuxButton',
  slot: 'StartIcon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.startIcon, styles[`iconSize${capitalize(ownerState.size)}`]];
  },
})({
  display: 'inherit',
  marginRight: 8,
  marginLeft: -4,
  variants: [
    {
      props: { size: 'sm' },
      style: {
        marginLeft: -2,
      },
    },
    ...commonIconStyles,
  ],
});

export const ButtonEndIcon = styled('span', {
  name: 'MuxButton',
  slot: 'EndIcon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.endIcon, styles[`iconSize${capitalize(ownerState.size)}`]];
  },
})({
  display: 'inherit',
  marginRight: -4,
  marginLeft: 8,
  variants: [
    {
      props: { size: 'sm' },
      style: {
        marginRight: -2,
      },
    },
    ...commonIconStyles,
  ],
});

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(inProps, ref) {
  // props priority: `inProps` > `contextProps` > `themeDefaultProps`
  const contextProps = React.useContext(ButtonGroupContext);
  const buttonGroupButtonContextPositionClassName = React.useContext(ButtonGroupButtonContext);
  const resolvedProps = resolveProps(contextProps as any, inProps);
  const props = useMuxDefaultProps({ props: resolvedProps, name: 'MuxButton' });
  const { button: { defaultProps }} = useTailwindTheme();
  
  const {
    children,
    color = defaultProps.color,
    component = 'button',
    variant = 'text',
    size = defaultProps.size,
    className,
    disabled = false,
    disableElevation = false,
    focusRipple = true,
    endIcon: endIconProp,
    startIcon: startIconProp,
    focusVisibleClassName = '',
    fullWidth = false,    
    type,
    ...other
  } = props;


  const ownerState = {
    ...props,
    color,
    component,
    disabled,
    disableElevation,
    focusRipple,
    fullWidth,
    size,
    type,
    variant,
    button: 'button'
  };

  const classes = useUtilityClasses(ownerState);

  const startIcon = startIconProp && (
    <ButtonStartIcon className={classes.startIcon} ownerState={ownerState}>
      {startIconProp}
    </ButtonStartIcon>
  );

  const endIcon = endIconProp && (
    <ButtonEndIcon className={classes.endIcon} ownerState={ownerState}>
      {endIconProp}
    </ButtonEndIcon>
  );

  const positionClassName = buttonGroupButtonContextPositionClassName || '';

  //console.log("Check react version equals: ", (window as any).React1 === (window as any).React2);

  return (
    <ButtonRoot
      
      className={clsx(contextProps.className, className, positionClassName)}
      component={component}
      disabled={disabled}
      focusRipple={focusRipple}
      focusVisibleClassName={clsx(classes.focusVisible, focusVisibleClassName)}
      data-ripple-color="color"
      ref={ref}
      type={type}
      {...other}
      ownerState={ownerState}
      classes={classes}
    >
      {startIcon}
      {children}
      {endIcon}
    </ButtonRoot>
  );
});

Button.displayName = "Mux.Button";
export * from './types';
export default Button;