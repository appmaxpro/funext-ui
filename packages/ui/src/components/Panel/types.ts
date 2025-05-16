import * as React from "react";

import type { SxThemeProps } from "../../styles";

import type {
  OverrideProps,
  OverridableComponent,
  OverridableTypeMap,
  OverridableStringUnion,
} from "../../uprops";

import type { PanelClasses } from "./panelClasses";
import type { Colors } from "../../types/generic";
import { propTypesColors } from "../../types/generic";
/**
 * This file contains the types and prop-types for Card, CardHeader, CardBody and CardFooter components.
 */

// typescript types
export type variant = "elevation" | "filled" | "gradient" | "outlined";
export type color =
  | "default"
  | "transparent"
  | "white"
  | "card"
  | "body"
  | "dark"
  | "light"
  | Colors;

export const propTypesVariant: any = [
  "elevation",
  "filled",
  "gradient",
  "outlined",
];
export const propTypesColor: any = [
  "default",
  "transparent",
  "white",
  "card",
  "body",
  "light",
  "dark",
  ...propTypesColors,
];

export interface PanelPropsVariantOverrides {}

export interface PanelOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<PanelClasses>;
  /**
   * Shadow depth, corresponds to `dp` in the spec.
   * It accepts values between 0 and 24 inclusive.
   * @default 1
   */
  elevation?: number | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * If `true`, rounded corners are disabled.
   * @default false
   */
  square?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The variant to use.
   * @default 'elevation'
   */
  variant?: OverridableStringUnion<
    "elevation" | "filled" | "outlined",
    PanelPropsVariantOverrides
  >;

  color?: color;

  fill?: boolean;
  border?: boolean;
}

export interface PanelTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = "div",
> {
  props: AdditionalProps & PanelOwnProps;
  defaultComponent: RootComponent;
}

/**
 *
 * Demos:
 *
 * - [Card](https://next.mui.com/material-ui/react-card/)
 * - [Panel](https://next.mui.com/material-ui/react-paper/)
 *
 * API:
 *
 * - [Panel API](https://next.mui.com/material-ui/api/paper/)
 */
//declare const Panel: OverridableComponent<PanelTypeMap>;

export interface ExtendPanelTypeMap<
  TypeMap extends OverridableTypeMap,
  Keys extends string = "",
> {
  props: TypeMap["props"] & Omit<PanelTypeMap["props"], Keys>;
  defaultComponent: TypeMap["defaultComponent"];
}

export type PanelProps<
  RootComponent extends React.ElementType = PanelTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  PanelTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

//export default Panel;
