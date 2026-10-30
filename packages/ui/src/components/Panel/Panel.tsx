import * as React from 'react';

// context
import findMatch from "../../utils/findMatch";
import values from "../../utils/values";

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

import { PanelProps, PanelOwnProps } from './types';
import { twMerge } from 'tailwind-merge';
import { getThemeColorClass, mapThemeColor } from '../../hooks';
import { TailwindTheme } from '../../mui';


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
      props: {
        fill: true
      },
      style: {
        backgroundColor: 'var(--color-card)',
      },
    },
    {
      props: {
        hasColor: true
      },
      style: {
        color: 'var(--color-card-fg)',
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
        borderWidth: 1,
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
  let color = mapThemeColor( props.color, defaultProps.color);

  // 3. set styles
  const panelRoot = '';//objectsToString(base.initial);
  const matchesVariant = variants[findMatch(valid.variants, variant, "")];
  const cardVariant = matchesVariant && values(
    matchesVariant[findMatch(valid.colors, color, "default")],
  );

  let className = twMerge(
    clsx(panelRoot, cardVariant,),
    defaultProps.className,
    props.className,
  );
   
  
  return {
    ...props,
    ...getThemeColorClass(color, className, undefined, variant === 'filled' ? 'bg' : 'border'),
    variant,
  }
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(function Panel(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuxPanel', resolve: resolvePanelProps }) as PanelProps;
    
  const theme = useTheme();
  
  let className = props.className || '';
  //console.log("PanelProps:", props)
  const {
    as = 'div',
    component = as,
    variant,
    elevation = variant === 'elevation' ? 1 : undefined,
    square = className.includes('rounded'),
    color,
    className:inClassName,
    fill,
    border,
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
    fill: fill || ((!className.includes('bg-') && (variant === 'filled'))),
    hasBorder: !className.includes('border-') && (variant === 'outlined' || border),
    hasText: !className.includes('text-') && (variant === 'filled' || fill),
  };

  const classes = useUtilityClasses(ownerState);

  if (process.env.NODE_ENV !== 'production' && elevation) {
    if (theme.shadows[elevation as number] === undefined) {
      console.error(
        [
          `MUX: The elevation provided <Panel elevation={${elevation}}> is not available in the theme.`,
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
      {...(other as any)}
      style={{
        ...(elevation && {
          '--panel-shadow': ((theme.vars || theme).shadows as any)[elevation] ?? `var(--tw-shadow-${elevation})`,
          /*
          ...(!theme.vars &&
            theme.palette.mode === 'dark' && {
              '--panel-overlay': `linear-gradient(${alpha(
                '#fff',
                getOverlayAlpha(elevation),
              )}, ${alpha('#fff', getOverlayAlpha(elevation))})`,
            }) as any,*/
        }),
        ...other.style,
      } as any}
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