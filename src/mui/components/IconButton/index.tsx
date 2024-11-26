"use strict";
import * as React from "react";

// utils
import { twMerge } from "tailwind-merge";
import { cn } from "../../utils/cn";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";
import { styled } from "../../styles";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  variant,
  size,
  color,
  ripple,
  className,
  children,
} from "../../types/components/button";

import { useThemeColor } from "../../hooks";
import { ButtonBase } from "../Button";
import type { ButtonBaseProps } from "../Button/ButtonBase";

export interface IconButtonProps extends ButtonBaseProps {
  variant?: variant;
  size?: size;
  color?: color | "transparent" | "inherit";
  fullWidth?: boolean;
  dense?: boolean;
}

let hasStyled = false;

try {
  //console.log("styled:", styled);
  hasStyled = true;
} catch (e) {
  console.error(e);
}
let IconButtonRoot;
if (hasStyled) {
  IconButtonRoot = styled(ButtonBase, {
    name: "MuxIconButton",
    slot: "Root",
  })({
    color: "inherit",
    textAlign: "center",
    flex: "0 0 auto",
    borderRadius: "50%",
    overflow: "visible",
    variants: [
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
          fontSize: ".875rem",
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
        },
      },
    ],
  });
} else {
  IconButtonRoot = "button";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant,
      size,
      color,
      ripple,
      focusRipple = true,
      className,
      fullWidth,
      dense,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { iconButton } = useTailwindTheme();
    const { valid, defaultProps, styles } = iconButton;
    const { base, variants, sizes } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = useThemeColor(color, defaultProps.color);
    ripple = ripple ?? defaultProps.ripple;
    className = twMerge(defaultProps.className || "", className);

    // 2. set styles
    const buttonBase = objectsToString(base);
    const variantName = findMatch(valid.variants, variant, "text");
    const colorMatches = findMatch(valid.colors, color, "transparent");
    const buttonVariantColor = variants[variantName][colorMatches];

    const buttonVariant = objectsToString(buttonVariantColor);

    const sizeName = findMatch(valid.sizes, size, "md");
    const buttonSize = objectsToString(sizes[sizeName]);
    const classes = cn(
      buttonBase,
      buttonSize,
      buttonVariant,
      dense && 'mt-ic-dense',
      `mt-ic-button mt-size-${sizeName}`,
      `mt-color-${color}`,
      className,
    );

    const ownerState = {
      size,
      color,
      variant,
      disabled: rest.disabled,
      dense
    };
    // 5. return
    return (
      <IconButtonRoot
        {...rest}
        ref={ref}
        className={classes}
        ripple={ripple}
        type={rest.type || "button"}
        ownerState={ownerState}
        focusRipple={focusRipple}
      />
    );
  },
);

IconButton.displayName = "Mux.IconButton";

export default IconButton;
