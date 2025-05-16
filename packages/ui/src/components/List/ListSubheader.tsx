import * as React from "react";
import { generateUtilityClasses, generateUtilityClass } from "../../styles";
import {
  SxThemeProps,
  styled,
  composeClasses,
  useMuxDefaultProps,
  clsx,
  memoTheme,
  Theme
} from "../../styles";

import { OverridableComponent, OverrideProps } from "../../theme/tw/props";

export interface ListSubheaderClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `color="primary"`. */
  colorPrimary: string;
  /** Styles applied to the root element if `color="inherit"`. */
  colorInherit: string;
  /** Styles applied to the inner `component` element unless `gutters={true}`. */
  gutters: string;
  /** Styles applied to the root element if `inset={true}`. */
  inset: string;
  /** Styles applied to the root element unless `sticky={true}`. */
  sticky: string;
}

export type ListSubheaderClassKey = keyof ListSubheaderClasses;

export function getListSubheaderUtilityClass(slot: string): string {
  return generateUtilityClass("MuxListSubheader", slot);
}

export const listSubheaderClasses: ListSubheaderClasses =
  generateUtilityClasses("MuxListSubheader", [
    "root",
    "colorPrimary",
    "colorInherit",
    "gutters",
    "inset",
    "sticky",
  ]);

export interface ListSubheaderOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ListSubheaderClasses>;
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   * @default 'default'
   */
  color?: "default" | "primary" | "muted" | "inherit";
  /**
   * If `false`, the List Subheader will not have gutters.
   * @default true
   */
  gutters?: boolean;
  /**
   * If `false`, the List Subheader will not stick to the top during scroll.
   * @default true
   */
  sticky?: boolean;
  /**
   * If `true`, the List Subheader is indented.
   * @default false
   */
  inset?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

export interface ListSubheaderTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = "li",
> {
  props: AdditionalProps & ListSubheaderOwnProps;
  defaultComponent: RootComponent;
}

export type ListSubheaderProps<
  RootComponent extends
    React.ElementType = ListSubheaderTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  ListSubheaderTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

const useUtilityClasses = (ownerState: any) => {
  const { classes, color, gutters, inset, sticky } = ownerState;

  const slots = {
    root: [
      "root",
      color !== "default" && `color-${color}`,
      !gutters && "gutters",
      inset && "inset",
      !sticky && "sticky",
    ],
  };

  return composeClasses(slots, getListSubheaderUtilityClass, classes);
};

const ListSubheaderRoot = styled("li", {
  name: "MuxListSubheader",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.color !== "default" && styles[`color-${ownerState.color}`],
      !ownerState.gutters && styles.gutters,
      ownerState.inset && styles.inset,
      !ownerState.sticky && styles.sticky,
    ];
  },
})(
  
  memoTheme(({ theme }: {theme:Theme}) => ({
    boxSizing: "border-box",
    lineHeight: "48px",
    listStyle: "none",
    color: theme.palette.text.secondary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(14),
    variants: [
      {
        props: {
          color: "primary",
        },
        style: {
          color: theme.palette.primary.main,
        },
      },
      {
        props: {
          color: "muted",
        },
        style: {
          color: theme.palette.text.disabled,
        },
      },
      {
        props: {
          color: "inherit",
        },
        style: {
          color: "inherit",
        },
      },
      {
        props: ({ ownerState }: any) => ownerState.gutters,
        style: {
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
      {
        props: ({ ownerState }: any) => ownerState.inset,
        style: {
          paddingLeft: 72,
        },
      },
      {
        props: ({ ownerState }: any) => ownerState.sticky,
        style: {
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: (theme.vars || theme).palette.background.paper,
        },
      },
    ],
  })),
);

export const ListSubheader = React.forwardRef<
  HTMLLIElement,
  ListSubheaderProps
>(function ListSubheader(inProps, ref) {
  const props = useMuxDefaultProps({
    props: inProps,
    name: "MuxListSubheader",
  }) as ListSubheaderProps;
  const {
    className,
    color = "default",
    component,
    gutters = false,
    sticky = true,
    inset = false,
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
    component,
    gutters,
    sticky,
    inset,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <ListSubheaderRoot
      as={component}
      className={clsx(classes.root, className)}
      ref={ref as any}
      ownerState={ownerState}
      {...other}
    />
  );
});

export default ListSubheader;
