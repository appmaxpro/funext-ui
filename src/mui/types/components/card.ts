import type { ReactNode } from "react";
import * as React from 'react';
// generic types
import type { Colors } from "../generic";
import { propTypesColors } from "../generic";

import type{ 
  SxThemeProps
} from '../../styles';

import type{ 
  OverrideProps, 
  OverridableComponent, 
  OverridableTypeMap,
  OverridableStringUnion,
  DistributiveOmit
} from '../../uprops';

import type{ PanelOwnProps } from './panel';
import type{ CardClasses } from '../../components/Card/style/cardClasses';

/**
 * This file contains the types and prop-types for Card, CardHeader, CardBody and CardFooter components.
 */

// typescript types
export type variant = "filled" | "gradient" | "outlined";
export type color = "default" | "transparent" | "white" | Colors;
export type shadow = boolean;
export type floated = boolean;
export type divider = boolean;
export type className = string;
export type children = ReactNode;

export const propTypesVariant: any = ["filled", "gradient", "outlined"];
export const propTypesColor: any = ["default", "transparent", "white", ...propTypesColors];


export interface CardOwnProps extends DistributiveOmit<PanelOwnProps, 'classes'> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CardClasses>;
  /**
   * If `true`, the card will use raised styling.
   * @default false
   */
  raised?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

export interface CardTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps & CardOwnProps;
  defaultComponent: RootComponent;
}

/**
 *
 * Demos:
 *
 * - [Card](https://next.mui.com/material-ui/react-card/)
 *
 * API:
 *
 * - [Card API](https://next.mui.com/material-ui/api/card/)
 * - inherits [Paper API](https://next.mui.com/material-ui/api/paper/)
 */

//declare const Card: OverridableComponent<CardTypeMap>;

export type CardProps<
  RootComponent extends React.ElementType = CardTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<CardTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};
