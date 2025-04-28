
import * as React from 'react';
import {
  styled, 
  clsx, 
  alpha, 
  composeClasses, 
  useMuxDefaultProps,
  type SxComponentProps
} 
from '../../styles';
import { getDividerUtilityClass, type DividerClassKey } from './dividerClasses';
import type{DividerProps} from '../../types/components/divider';
import { twMerge } from 'tailwind-merge';
import { mapThemeColor } from '../../hooks';


const useUtilityClasses = (ownerState:any) => {
  const { absolute, children, classes, flexItem, light, orientation, textAlign, variant } =
    ownerState;

  const slots = {
    root: [
      'root',
      absolute && 'absolute',
      variant,
      light && 'light',
      orientation === 'vertical' && 'vertical',
      flexItem && 'flexItem',
      children && 'withChildren',
      children && orientation === 'vertical' && 'withChildrenVertical',
      textAlign === 'right' && orientation !== 'vertical' && 'textAlignRight',
      textAlign === 'left' && orientation !== 'vertical' && 'textAlignLeft',
    ],
    wrapper: ['wrapper', orientation === 'vertical' && 'wrapperVertical'],
  };

  return composeClasses(slots, getDividerUtilityClass, classes);
};

const DividerRoot = styled('div', {
  name: 'MuxDivider',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.absolute && styles.absolute,
      styles[ownerState.variant],
      ownerState.light && styles.light,
      ownerState.orientation === 'vertical' && styles.vertical,
      ownerState.flexItem && styles.flexItem,
      ownerState.children && styles.withChildren,
      ownerState.children && ownerState.orientation === 'vertical' && styles.withChildrenVertical,
      ownerState.textAlign === 'right' &&
        ownerState.orientation !== 'vertical' &&
        styles.textAlignRight,
      ownerState.textAlign === 'left' &&
        ownerState.orientation !== 'vertical' &&
        styles.textAlignLeft,
    ];
  },
})<SxComponentProps<any>>(({ theme }) => ({
  margin: 0, // Reset browser default style.
  flexShrink: 0,
  borderWidth: 0,
  borderStyle: 'solid',
  borderColor: `var(--tw-border-color, ${(theme.vars || theme).palette.divider})`,
  borderBottomWidth: 'thin',
  variants: [
    {
      props: {
        absolute: true,
      },
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
      },
    },
    {
      props: {
        light: true,
      },
      style: {
        borderColor: `var(--tw-border-color, ${theme.vars
          ? 'rgba('+theme.vars.palette.dividerChannel+'/ 0.08)'
          : alpha(theme.palette.divider, 0.08)})`,
      },
    },
    {
      props: {
        variant: 'inset',
      },
      style: {
        marginLeft: 72,
      },
    },
    {
      props: {
        variant: 'middle',
        orientation: 'horizontal',
      },
      style: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
      },
    },
    {
      props: {
        variant: 'middle',
        orientation: 'vertical',
      },
      style: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
    },
    {
      props: {
        orientation: 'vertical',
      },
      style: {
        height: '100%',
        borderBottomWidth: 0,
        borderRightWidth: 'thin',
      },
    },
    {
      props: {
        flexItem: true,
      },
      style: {
        alignSelf: 'stretch',
        height: 'auto',
      },
    },
    {
      props: ({ ownerState }:any) => !!ownerState.children,
      style: {
        display: 'flex',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        border: 0,
        borderTopStyle: 'solid',
        borderLeftStyle: 'solid',
        '&::before, &::after': {
          content: '""',
          alignSelf: 'center',
        },
      },
    },
    {
      props: ({ ownerState }:any) => ownerState.children && ownerState.orientation !== 'vertical',
      style: {
        '&::before, &::after': {
          width: '100%',
          borderTopWidth: 'thin',
          borderTopStyle: 'inherit',
          borderTopColor: `var(--tw-border-color, ${(theme.vars || theme).palette.divider})`,
        },
      },
    },
    {
      props: ({ ownerState }:any) => ownerState.orientation === 'vertical' && ownerState.children,
      style: {
        flexDirection: 'column',
        '&::before, &::after': {
          height: '100%',
          borderLeftWidth: 'thin',
          borderLeftStyle: 'inherit',
          borderLeftColor: `var(--tw-border-color, ${(theme.vars || theme).palette.divider})`,
        },
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.textAlign === 'right' && ownerState.orientation !== 'vertical',
      style: {
        '&::before': {
          width: '90%',
        },
        '&::after': {
          width: '10%',
        },
      },
    },
    {
      props: ({ ownerState }:any) =>
        ownerState.textAlign === 'left' && ownerState.orientation !== 'vertical',
      style: {
        '&::before': {
          width: '10%',
        },
        '&::after': {
          width: '90%',
        },
      },
    },
  ],
}));

const DividerWrapper = styled('span', {
  name: 'MuxDivider',
  slot: 'Wrapper',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.wrapper, ownerState.orientation === 'vertical' && styles.wrapperVertical];
  },
})(({ theme }) => ({
  display: 'inline-block',
  paddingLeft: `calc(${theme.spacing(1)} * 1.2)`,
  paddingRight: `calc(${theme.spacing(1)} * 1.2)`,
  variants: [
    {
      props: {
        orientation: 'vertical',
      },
      style: {
        paddingTop: `calc(${theme.spacing(1)} * 1.2)`,
        paddingBottom: `calc(${theme.spacing(1)} * 1.2)`,
      },
    },
  ],
}));

const Divider = React.forwardRef<HTMLElement,DividerProps>((inProps, ref) => {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxDivider' }) as DividerProps;
  const {
    absolute = false,
    children,
    className,
    vertical,
    orientation = (vertical && 'vertical' || 'horizontal'),
    component = children || orientation === 'vertical' ? 'div' : 'hr',
    flexItem = false,
    light = false,
    role = component !== 'hr' ? 'separator' : undefined,
    textAlign = 'center',
    variant = 'fullWidth',
    color,
    ...other
  } = props;

  const dividerColor = mapThemeColor(color);
  
  const ownerState = {
    ...props,
    absolute,
    component,
    flexItem,
    light,
    orientation,
    role,
    textAlign,
    variant,
  };

  const classes = useUtilityClasses(ownerState);
  
  return (
    <DividerRoot
      as={component}
      className={twMerge(clsx(classes.root), className)}
      role={role}
      ref={ref as any}
      ownerState={ownerState}
      area-disabled="true"
      aria-orientation={
        role === 'separator' && (component !== 'hr' || orientation === 'vertical')
          ? orientation
          : undefined
      }
      {...other}
    >
      {children ? (
        <DividerWrapper className={classes.wrapper} ownerState={ownerState}>
          {children}
        </DividerWrapper>
      ) : null}
    </DividerRoot>
  );
});

/**
 * The following flag is used to ensure that this component isn't tabbable i.e.
 * does not get highlight/focus inside of MUI List.
 */

export type{
  DividerProps,
  DividerClassKey
}
export {Divider}

export default Divider;