import * as React from 'react';

// context
import { useTailwindTheme as simpleUseTheme } from "../../theme";

import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

import { 
  styled, 
  useTheme, 
  useDefaultProps,
  clsx,
  getOverlayAlpha,
  composeClasses,
  alpha,
  memoTheme,
  type StyledComponent
} 
from '../../styles';

import { 
  getPanelUtilityClass, 
  type PanelClasses,
  type PanelClassKey 

} from './panelClasses';

import { PanelProps, PanelOwnProps } from '../../types/components/panel';
import { twMerge } from 'tailwind-merge';
import { TailwindTheme } from '../../components';
import { useColorClass, useThemeColor } from '../../hooks';
import { isNumeric } from '@/core/system/utils';


const useUtilityClasses = (ownerState:PanelOwnProps) => {
  const { square, elevation, variant, classes } = ownerState;

  const slots = {
    root: [
      'root',
      variant,
      !square && 'rounded',
      variant === 'elevation' && `elevation${elevation}`,
    ],
  };

  return composeClasses(slots, getPanelUtilityClass, classes);
};

export const PanelRoot = styled('div', {
  name: 'MuxPanel',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      !ownerState.square && styles.rounded,
      ownerState.hasShadow && styles[`elevation${ownerState.elevation}`],
    ];
  },
})(memoTheme(({ theme }:any) => ({  
  transition: theme.transitions.create('box-shadow'),
  variants: [
    {
      props: ({ ownerState }:any) => !ownerState.hasBg,
      style: {
        backgroundColor: (theme.vars || theme).palette.background?.paper,
      },
    },
    {
      props: ({ ownerState }:any) => !ownerState.hasColor,
      style: {
        color: (theme.vars || theme).palette.text?.primary,
      },
    },
    {
      props: ({ ownerState }:any) => !ownerState.square,
      style: {
        borderRadius: theme.shape?.borderRadius,
      },
    },
    {
      props: {
        variant: 'outlined',
        hasBorder: false,
      },
      style: {
        border: `1px solid var(--tw-border-color)`,
      },
    },
    {
      props: {
        hasShadow: true,
      },
      style: {
        boxShadow: 'var(--panel-shadow)',
        backgroundImage: 'var(--panel-overlay)',
      },
    },
  ],
})))  as StyledComponent<PanelOwnProps>;


const resolvePanelProps = (props:PanelProps, theme: TailwindTheme) =>  {
  const { panel } = theme;
  const { defaultProps, styles, valid } = panel;
  const { base, variants } = styles;
  let variant =  props.variant ?? defaultProps.variant;
  let color = useThemeColor( props.color, defaultProps.color);

  // 3. set styles
  const panelRoot = objectsToString(base.initial);
  const matchesVariant = variants[findMatch(valid.variants, variant, "")];
  const cardVariant = matchesVariant && objectsToString(
    matchesVariant[findMatch(valid.colors, color, "default")],
  );

  let className = twMerge(
    clsx(panelRoot, cardVariant,),
    defaultProps.className,
    props.className,
  );
   
  
  return {
    ...props,
    ...useColorClass(color, className, undefined, variant === 'filled' ? 'bg' : 'border'),
    variant,
  }
}

export const Panel = React.forwardRef<HTMLElement, PanelProps>(function Panel(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuxPanel', resolve: resolvePanelProps }) as PanelProps;
    
  const theme = useTheme();
  
  let className = props.className || '';

  const {
    as = 'div',
    component = as,
    variant = 'elevation',
    elevation = variant === 'elevation' ? 1 : undefined,
    square = className.includes('rounded'),
    color,
    className:inClassName,
    ...other
  } = props;

  const ownerState = {
    ...other,
    className,
    component,
    elevation,
    square,
    variant,
    hasShadow: !!elevation,
    hasBg: className.includes('bg-'),
    hasBorder: className.includes('border-'),
    hasText: className.includes('text-'),
  };

  const classes = useUtilityClasses(ownerState);

  if (process.env.NODE_ENV !== 'production') {
    if (theme.shadows[elevation] === undefined) {
      console.error(
        [
          `MUI: The elevation provided <Panel elevation={${elevation}}> is not available in the theme.`,
          `Please make sure that \`theme.shadows[${elevation}]\` is defined.`,
        ].join('\n'),
      );
    }
  }
  
  
  return (
    <PanelRoot
      as={component}
      ownerState={ownerState}
      className={clsx(classes.root, className)}
      ref={ref as any}
      {...other}
      style={{
        ...(elevation && {
          '--panel-shadow': (theme.vars || theme).shadows[elevation],
          ...(theme.vars && {
            '--panel-overlay': theme.vars.overlays?.[elevation],
          }),
          ...(!theme.vars &&
            theme.palette.mode === 'dark' && {
              '--panel-overlay': `linear-gradient(${alpha(
                '#fff',
                getOverlayAlpha(elevation),
              )}, ${alpha('#fff', getOverlayAlpha(elevation))})`,
            }),
        }),
        ...other.style,
      }}
    />
  );
});

export type{ 
  PanelProps, 
  PanelOwnProps,
  PanelClasses,
  PanelClassKey
};

export default Panel;