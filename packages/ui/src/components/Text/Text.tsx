import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";


import { capitalize } from "../../utils/core";

import {
  clsx,
  styled,
  useMuxDefaultProps,
  extendSxProp,
  composeClasses,
  alpha,
  getPath,
  useDefaultProps,
} from "../../styles";

import type { Theme, StyledComponentOwner } from "../../styles";

import type { TextOwnProps, TextProps } from "./types";
import type { TextClassKey} from './textClasses';

import {
  getTextUtilityClass,
  TextClasses,
} from "./textClasses";
import { getThemeColorClass } from "../../hooks";

const useUtilityClasses = (ownerState: any) => {
  const { align, gutterBottom, noWrap, paragraph, variant, classes } =
    ownerState;

  const slots = {
    root: [
      "root",
      variant,
      ownerState.align !== "inherit" && `align${capitalize(align)}`,
      gutterBottom && "gutterBottom",
      noWrap && "noWrap",
      paragraph && "paragraph",
    ],
  };

  return composeClasses(slots, getTextUtilityClass, classes);
};

export const TextRoot = styled("span", {
  name: "MuiTypography",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.variant && styles[ownerState.variant],
      ownerState.align !== "inherit" &&
        styles[`align${capitalize(ownerState.align)}`],
      ownerState.noWrap && styles.noWrap,
      ownerState.gutterBottom && styles.gutterBottom,
      ownerState.paragraph && styles.paragraph,
      ownerState.fw && `fw${styles.fw}`,
    ];
  },
})(({ theme }) => ({
  margin: 0,
  variants: [
    {
      props: {
        variant: "inherit",
      },
      style: {
        // Some elements, like <button> on Chrome have default font that doesn't inherit, reset this.
        font: "inherit",
        lineHeight: "inherit",
        letterSpacing: "inherit",
      },
    },
    ...Object.entries(theme.typography || {})
      .filter(
        ([variant, value]) =>
          variant !== "inherit" && value && typeof value === "object",
      )
      .map(([variant, value]) => ({
        props: { variant },
        style: value,
      })),
    ...Object.entries(theme.palette)
      .filter(([, value]) => value && value.main)
      .map(([color]) => ({
        props: { color },
        style: {
          color: ((theme.vars || theme) as any).palette[color].main,
        },
      })),
    ...Object.entries(theme.palette?.text || {})
      .filter(([, value]) => typeof value === "string")
      .map(([color]) => ({
        props: { color: `text${capitalize(color)}` },
        style: {
          color: ((theme.vars || theme) as any).palette.text[color],
        },
      })),
    {
      props: ({ ownerState }: any) => ownerState.align !== "inherit",
      style: {
        textAlign: "var(--text-align)",
      },
    },
    {
      props: ({ ownerState }: any) => !!ownerState.fw,
      style: {
        fontWeight: "var(--font-weight)",
      },
    },
    {
      props: ({ ownerState }: any) => ownerState.noWrap,
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    {
      props: ({ ownerState }: any) => ownerState.gutterBottom,
      style: {
        marginBottom: "0.35em",
      },
    },
    {
      props: ({ ownerState }: any) => ownerState.paragraph,
      style: {
        marginBottom: 16,
      },
    },
  ],
})) as StyledComponentOwner<TextProps, TextOwnProps>;

const resolveProps = (
  { color, className, ...rest }: TextProps,
  theme: any,
) => {
  // 1. init
  const { text } = theme;
  const { defaultProps, valid, styles } = text;
  const { variants, colors } = styles;

  // 2. set default props
  //variant = variant ?? defaultProps.variant;
  color = color ?? defaultProps.color;
  className = twMerge(defaultProps.className || "", className);

  const { color: asColor, className: asClassName } = getThemeColorClass(
    color,
    className,
    undefined,
    "text",
  );

  let result: any = {
    ...rest,

  };
  let typographyVariant;
  let typographyColor;

  if (asColor && typeof asColor === "string" && colors[asColor]) {
    typographyColor = colors[asColor as string].color;
  } else if (asColor) {
    result["color"] = asColor;
  }

  result["className"] = twMerge(asClassName, typographyColor);

  return result;
};

const defaultVariantMapping: any = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "h6",
  subtitle2: "h6",
  body1: "span",
  body2: "span",
  inherit: "span",
  small: "small",
};

const v6Colors: any = {
  primary: true,
  secondary: true,
  error: true,
  info: true,
  success: true,
  warning: true,
  textPrimary: true,
  textSecondary: true,
  textDisabled: true,
};

export function useTypographyDefaultProps<Props extends TextProps>(
  props:Props, name:string='MuxText') {
  const result = useDefaultProps({
    props,
    name,
    resolve: resolveProps,
  }) as Props;
       
   return result;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  function Typography(inProps, ref) {
    const { color, as:xAs, ...themeProps } = useTypographyDefaultProps(inProps) as TextProps;

    const isSxColor = color && !v6Colors[color as string];
    // TODO: Remove `extendSxProp` in v7
    const props = extendSxProp({
      ...themeProps,
      ...(isSxColor && color && { color }),
    });

    const {
      align = "inherit",
      className,
      as,
      component = as,
      gutterBottom = false,
      noWrap = false,
      variant = "body1",
      variantMapping = defaultVariantMapping,
      fw,
      ...other
    } = props;

    const ownerState = {
      ...props,
      align,
      color,
      className,
      component,
      gutterBottom,
      noWrap,
      variant,
      variantMapping,
      fw
    };

    const Component =
      component ||
      variantMapping[variant] ||
      defaultVariantMapping[variant] ||
      "span";

    const classes = useUtilityClasses(ownerState);

    return (
      <TextRoot
        as={Component}
        ref={ref}
        className={clsx(classes.root, className)}
        {...other}
        ownerState={ownerState as any}
        style={{
          ...(align !== "inherit" && { "--text-align": align }),
          ...(fw && { "--font-weight": fw }),
          ...other.style,
        }}
      />
    );
  },
);

Text.displayName = "Mux.Text";

export type { 
  TextOwnProps, 
  TextProps, 
  TextClassKey 
};

export default Text;
