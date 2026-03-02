"use strict";
import * as React from "react";

// utils
import { cn } from "../../utils/cn";
import findMatch from "../../utils/findMatch";
import values from "../../utils/values";
import {
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  Theme,
} from "../../styles";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  variant,
  size,
  color,
} from "../../types/components/button";

import { mapThemeColor } from "../../hooks";
import { ButtonBase } from "../Button";
import type { ButtonBaseProps } from "../Button/ButtonBase";
import { capitalize } from "../../utils";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import { fontSize } from "@mui/system";

export interface IconButtonProps extends ButtonBaseProps {
  variant?: variant;
  size?: size | 'inherit';
  color?: color | "transparent" | "inherit";
  dense?: boolean;
  disableElevation?: boolean;
  focusVisible?: boolean;
}

export function getIconButtonUtilityClass(slot: string): string {
  return generateUtilityClass("MuxIconButton", slot);
}

export const iconButtonClasses = generateUtilityClasses("MuxIconButton", [
  "root",
  "text",
  "outlined",
  "filled",
  "ghost",
  "disableElevation",
  "focusVisible",
  "disabled",
  "sizeMd",
  "sizeSm",
  "sizeLg",
  "dense",
]);

const useUtilityClasses = (ownerState: any) => {
  const { color, disableElevation, size, variant, classes, disable, dense } =
    ownerState;

  const slots = {
    root: [
      "root",
      variant,
      `size${capitalize(size)}`,
      `color${capitalize(color)}`,
      disableElevation && variant === "filled" && "disableElevation",
      dense && "dense",
    ],
  };

  const composedClasses = composeClasses(slots, getIconButtonUtilityClass, classes);

  return {
    ...classes, // forward the focused, disabled, etc. classes to the ButtonBase
    ...composedClasses,
  };
};

let IconButtonRoot = styled(ButtonBase, {
  name: "MuxIconButton",
  slot: "Root",
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      styles[`${ownerState.variant}${capitalize(ownerState.color)}`],
      styles[`size${capitalize(ownerState.size)}`],
      styles[`${ownerState.variant}Size${capitalize(ownerState.size)}`],
      ownerState.disableElevation && styles.disableElevation,
    ];
  },
})(
  memoTheme(({ theme }: { theme: Theme }) => ({
    textAlign: "center",
    flex: "0 0 auto",
    borderRadius: "50%",
    overflow: "visible",
    transition:
      "box-shadow,border-color,opacity,color," +
      theme.transitions.create("background-color", {
        duration: theme.transitions.duration.standard,
      }),
    [`&.${iconButtonClasses.disabled}`]: {
      //color: theme.palette.action.disabled,
      opacity: .5
    },
    variants: [
      {
        props: {
          variant: "filled",
          disableElevation: false,
        },
        style: {
          boxShadow: theme.shadows[2],
          "&:hover": {
            boxShadow: theme.shadows[4],
            // Reset on touch devices, it doesn't add specificity
            "@media (hover: none)": {
              boxShadow: theme.shadows[2],
            },
          },
          "&:active": {
            boxShadow: theme.shadows[8],
          },
          [`&.${iconButtonClasses.focusVisible}`]: {
            boxShadow: theme.shadows[6],
          },
          [`&.${iconButtonClasses.disabled}`]: {
            color: theme.palette.action.disabled,
            boxShadow: theme.shadows[0],
            backgroundColor: theme.palette.action.disabledBackground,
          },
        },
      },
      {
        props: {
          size: "sm",
        },
        style: {
          padding: "0.375rem",
          fontSize: "1.125rem",
        },
      },
      {
        props: {
          size: "md",
        },
        style: {
          padding: "0.5rem",
          fontSize: "1.5rem", //1.75rem
        },
      },
      {
        props: {
          size: "lg",
        },
        style: {
          padding: "0.625rem",
          fontSize: "1.875rem",
        },
      },
      {
        props: {
          size: "md",
          dense: true,
        },
        style: {
          padding: "4px",
          fontSize: "20px",
          ['& [data-ui="icon"]']:{
            fontSize: ''
          }
        },
      },
    ],
  })),
);

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant,
      size,
      color,
      ripple,
      focusRipple = true,
      className,
      dense,
      disabled,
      disableElevation = false,
      focusVisible = true,
      children,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { iconButton } = useTailwindTheme();
    const { valid, defaultProps, styles } = iconButton;
    const { base, variants, sizes } = styles;

    const { themeClassName, classes, ownerState } = React.useMemo(() => {
      // 2. set default props
      variant = variant ?? defaultProps.variant;
      size = size ?? defaultProps.size;
      color = mapThemeColor(color, defaultProps.color);
      ripple = ripple ?? defaultProps.ripple;
      // 2. set styles
      const buttonBase = values(base);
      const variantName = findMatch(valid.variants, variant, "text");
      const colorMatches = findMatch(valid.colors, color, "transparent");
      const buttonVariantColor = variants[variantName][colorMatches];

      const buttonVariant = values(buttonVariantColor);

      //const sizeName = findMatch(valid.sizes, size, "md");
      //const buttonSize = objectsToString(sizes[sizeName]);
      const themeClassName = cn(buttonBase, buttonVariant, defaultProps.className, className);

      const ownerState = {
        ...rest,
        size,
        color,
        variant,
        disabled: disabled ?? false,
        dense,
        disableElevation,
        focusVisible,
      };
      const classes = useUtilityClasses(ownerState);
      return { classes, ownerState, themeClassName };
    }, [iconButton, variant, color, size, className, disabled, focusVisible]);

    // 5. return
    return (
      <IconButtonRoot
        {...rest}
        ref={ref}
        className={themeClassName}
        ripple={ripple}
        type={rest.type || "button"}
        ownerState={ownerState}
        focusRipple={focusRipple}
        disabled={disabled}
        classes={classes}
      >
       {children }  
    </IconButtonRoot>
    );
  },
);

IconButton.displayName = "Mux.IconButton";

export default IconButton;
