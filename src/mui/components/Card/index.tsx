import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { 
  useTheme as useMuiTheme,
  styled, 
  useDefaultProps,
  clsx,
  getOverlayAlpha,
  composeClasses,
  alpha,
  type StyledComponent
} 
from '../../styles';

import { 
  getCardUtilityClass, 
  type CardClasses,
  type CardClassKey 

} from './style/cardClasses';

import { CardProps, CardOwnProps } from '../../types/components/card';
import Panel, {PanelRoot} from "../Panel";

// card components
import { CardHeader, CardHeaderProps } from "./CardHeader";
import { CardBody, CardBodyProps } from "./CardBody";
import { CardFooter, CardFooterProps } from "./CardFooter";
import { useColorClass, useThemeColor } from "../../hooks";

const useUtilityClasses = (ownerState:any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getCardUtilityClass, classes);
};

const CardRoot = styled(PanelRoot, {
  name: 'MuxCard',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})({
  overflow: 'hidden',
}) as StyledComponent<CardOwnProps & Partial<CardProps>>;


const resolvePanelProps = (props:CardProps, theme: any) =>  {
  // 1. init
  const { card } = theme;
  const { defaultProps, styles, valid } = card;
  const { base, variants } = styles;

  // 2. set default props
  let variant = props.variant ?? defaultProps.variant;
  let color = useThemeColor(props.color, defaultProps.color);

  // 3. set styles
  const cardRoot = objectsToString(base.initial);
  const cardVariant = objectsToString(
    variants[findMatch(valid.variants, variant, "filled")][
      findMatch(valid.colors, color, "default")
    ],
  );

  let className = twMerge(
    clsx(cardRoot, cardVariant,),
    defaultProps.className,
    props.className,
  );

  return {
    ...props,
    ...useColorClass(color, className, undefined, variant === 'filled' ? 'bg' : 'border'),
    variant,
  }
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (inProps, ref) => {
  
  const props = useDefaultProps({ 
      props: inProps,
      name: 'MuxCard', 
      resolve: resolvePanelProps }) as CardProps;
    
  const theme = useMuiTheme();

  let className = props.className || '';

  const {
    as = 'div',
    component = as,
    variant = 'elevation',
    elevation = variant === 'elevation' ? 1 : undefined,
    square = className.includes('rounded'),
    color,
    raised = false,
    className:inClassName,
    ...other
  } = props;

  const ownerState = {
    ...props,
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
    <CardRoot
      as={component}
      ownerState={ownerState}
      className={clsx(classes.root, className)}
      {...other}
      ref={ref as any}
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
      }}/>
  );

  },
);

Card.displayName = "Mux.Card";

export type { 
  CardHeaderProps, 
  CardBodyProps, 
  CardFooterProps ,
  CardProps, 
  CardOwnProps,
  CardClasses,
  CardClassKey
};
export { Card, CardHeader, CardBody, CardFooter };
export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
