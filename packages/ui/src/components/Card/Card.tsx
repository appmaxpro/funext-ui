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
  type StyledComponent,
  generateUtilityClasses,
  generateUtilityClass
} 
from '../../styles';

import { CardProps, CardOwnProps } from '../../types/components/card';
import Panel, {PanelRoot} from "../Panel";

// card components
import { CardHeader, CardHeaderProps } from "./CardHeader";
import { CardBody, CardBodyProps } from "./CardBody";
import { CardFooter, CardFooterProps } from "./CardFooter";
import { getThemeColorClass, mapThemeColor } from "../../hooks";
import { CardMedia } from "./CardMedia";
import { CardActions} from "./CardActions";
import { CardActionArea} from "./CardActionArea";

export * from "./CardBody";
export * from "./CardHeader";
export * from "./CardFooter";
export * from "./CardMedia";
export * from "./CardActions";
export * from "./CardActionArea";
export * from '../../types/components/card';

export interface CardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CardClassKey = keyof CardClasses;

export function getCardUtilityClass(slot: string): string {
  return generateUtilityClass('MuxCard', slot);
}

export const cardClasses: CardClasses = generateUtilityClasses('MuxCard', ['root']);


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
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
}) ;


const resolvePanelProps = (props:CardProps, theme: any) =>  {
  // 1. init
  const { card } = theme;
  const { defaultProps, styles, valid } = card;
  const { base, variants } = styles;

  // 2. set default props
  let variant = props.variant ?? defaultProps.variant;
  let color = mapThemeColor(props.color, defaultProps.color);

  // 3. set styles
  const cardRoot = objectsToString(base.initial);
  const cardVariant = objectsToString(
    variants[findMatch(valid.variants, variant, "outlined")][
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
    ...getThemeColorClass(color, className, undefined, variant === 'filled' ? 'bg' : variant === 'outlined' ? 'border' : undefined),
    variant,
  }
}

export const CardFc = React.forwardRef<HTMLDivElement, CardProps>(
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
    fill,
    border,
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
    fill: fill || (!className.includes('bg-') && variant === 'filled'),
    hasBorder: !className.includes('border-') && (variant === 'outlined' || border),
    hasText: !className.includes('text-') && (variant === 'filled' || fill),
  };

  const classes = useUtilityClasses(ownerState);

  if (process.env.NODE_ENV !== 'production' && elevation) {
    if (theme.shadows[elevation as any] === undefined) {
      console.error(
        [
          `MUX: The elevation provided <Card elevation={${elevation}}> is not available in the theme.`,
          `Please make sure that \`theme.shadows[${elevation}]\` is defined.`,
        ].join('\n'),
      );
    }
  }

  return (
    <CardRoot
      as={component as any}
      ownerState={ownerState as any}
      className={clsx(classes.root, className)}
      {...(other as any)}
      ref={ref as any}
      style={{
        ...(elevation && {
          '--panel-shadow': ((theme.vars || theme).shadows as any)[elevation],
          /*
          ...(theme.vars && {
            '--panel-overlay': theme.vars.overlays?.[elevation],
          }),
          ...(!theme.vars &&
            theme.palette.mode === 'dark' && {
              '--panel-overlay': `linear-gradient(${alpha(
                '#fff',
                getOverlayAlpha(elevation),
              )}, ${alpha('#fff', getOverlayAlpha(elevation))})`,
            }) as any,*/
        }),
        ...other.style,
      }}/>
  );

  },
);

const Card =  Object.assign(CardFc, {
  Header: CardHeader,
  Body: CardBody,
  Content: CardBody,
  Footer: CardFooter,
  Media: CardMedia,
  Actions: CardActions,
  ActionArea:CardActionArea
});
Card.displayName = "Mux.Card";

export default Card;
