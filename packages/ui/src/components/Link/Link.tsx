import * as React from "react";
import isFocusVisible from "@mui/utils/isFocusVisible";
import { capitalize } from "../../utils/core";
import {
  clsx,
  styled,
  useTheme,
  useMuxDefaultProps,
  composeClasses,
  alpha,
  getPath,
  type SxThemeProps,
  type StyledComponent,
  memoTheme,
  Theme,
  twx,
} from "../../styles";

import { Text, useTypographyDefaultProps, TextRoot } from "../Text";
import linkClasses, {
  getLinkUtilityClass,
  type LinkClassKey,
} from "./linkClasses";
import type { LinkProps, LinkOwnProps } from "./types";

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

const useUtilityClasses = (ownerState: any) => {
  const { classes, component, focusVisible, underline } = ownerState;

  const slots = {
    root: [
      "root",
      `underline${capitalize(underline)}`,
      component === "button" && "button",
      focusVisible && "focusVisible",
    ],
  };

  return composeClasses(slots, getLinkUtilityClass, classes);
};

const LinkRoot = styled(TextRoot, {
  name: "MuxLink",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[`underline${capitalize(ownerState.underline)}`],
      ownerState.component === "button" && styles.button,
    ];
  },
})(
  memoTheme(({ theme }) => {
    return {
      variants: [
        {
          props: {
            underline: "none",
          },
          style: {
            textDecoration: "none",
          },
        },
        {
          props: {
            underline: "hover",
          },
          style: {
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          },
        },
        {
          props: {
            underline: "always",
          },
          style: {
            textDecoration: "underline",
            "&:hover": {
              textDecorationColor: "inherit",
            },
          },
        },
        {
          props: ({ underline, ownerState }: any) =>
            underline === "always" && ownerState.color !== "inherit",
          style: {
            textDecorationColor: "var(--Link-underlineColor)",
          },
        },
        ...Object.entries(theme.palette)
          .filter(([, value]) => value && value.main)
          .map(([color]) => ({
            props: { underline: "always", color },
            style: {
              "--link-underline-color": twx.alpha('primary', .4),
            },
          })),
        {
          props: { underline: "always", color: "textPrimary" },
          style: {
            "--link-underline-color": twx.alpha('primary', .4),
          },
        },
        {
          props: { underline: "always", color: "textSecondary" },
          style: {
            "--link-underline-color": twx.alpha('secondary', 0.4),
          },
        },
        {
          props: { underline: "always", color: "textDisabled" },
          style: {
            "--link-underline-color": (theme.vars || theme).palette.text
              .disabled,
          },
        },
        {
          props: {
            component: "button",
          },
          style: {
            position: "relative",
            WebkitTapHighlightColor: "transparent",
            backgroundColor: "transparent", // Reset default value
            // We disable the focus ring for mouse, touch and keyboard users.
            outline: 0,
            border: 0,
            margin: 0, // Remove the margin in Safari
            borderRadius: 0,
            padding: 0, // Remove the padding in Firefox
            cursor: "pointer",
            userSelect: "none",
            verticalAlign: "middle",
            MozAppearance: "none", // Reset
            WebkitAppearance: "none", // Reset
            "&::-moz-focus-inner": {
              borderStyle: "none", // Remove Firefox dotted outline.
            },
            [`&.${linkClasses.focusVisible}`]: {
              outline: "auto",
            },
          },
        },
      ],
    };
  }),
) as StyledComponent<LinkOwnProps>;

export const Link = React.forwardRef<HTMLElement, LinkProps>(
  function Link(inProps, ref) {
    const { variant = "inherit", color = variant === "inherit" ? "inherit" : "primary" } = inProps;
    
    const props = useTypographyDefaultProps(
      { ...inProps, color, variant } as any,
      "MuxLink",
    );

    const theme = useTheme();
    
    const {
      className,
      component = "a",
      onBlur,
      onFocus,
      TypographyClasses,
      underline = "none",
      sx,
      color: asColor,
      variant: asVariant,
      disabled,
      fw,
      ...other
    } = props;

    const underlineVal =
      typeof underline === "boolean"
        ? (underline && "always") || "none"
        : underline || "none";

    const [focusVisible, setFocusVisible] = React.useState(false);
    const handleBlur = (event: any) => {
      if (!isFocusVisible(event.target)) {
        setFocusVisible(false);
      }
      if (onBlur) {
        onBlur(event);
      }
    };
    const handleFocus = (event: any) => {
      if (isFocusVisible(event.target)) {
        setFocusVisible(true);
      }
      if (onFocus) {
        onFocus(event);
      }
    };

    const ownerState = {
      ...props,
      component,
      underline: underlineVal,
      focusVisible,
      color,
      variant,
      disabled,

    };

    const classes = useUtilityClasses(ownerState);
    
    return (
      <LinkRoot
        color={asColor}
        //variant={asVariant}
        className={clsx(classes.root, className)}
        classes={TypographyClasses}
        as={component}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={ref}
        ownerState={ownerState}
        fw={fw}
        sx={sx}
        {...other}
        /*sx={
          extra
            ? [...(extra ? [extra] : []), ...(Array.isArray(sx) ? sx : [sx])]
            : sx
        }*/
        style={{
          ...other.style,
          ...(underline === "always" &&
            color &&
            color !== "inherit" &&
            !v6Colors[color] && {
              "--link-underline-color": getTextDecoration({
                theme,
                ownerState,
              }),
            }),
        }}
      />
    );
  },
);

const getTextDecoration = <T extends Theme>({
  theme,
  ownerState,
}: {
  theme: T;
  ownerState: { color: string };
}) => {
  
  try {
    return twx.alpha(ownerState.color ?? 'primary', 0.4) ;
  } catch (ex) {}
};

export type { LinkProps, LinkOwnProps, LinkClassKey };

export default Link;
