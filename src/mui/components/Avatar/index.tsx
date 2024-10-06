import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type { variant, size, className, withBorder, color } from "../../types/components/avatar";
import { styled } from "../../styles";

const AvatarRoot = styled('div', {
  name: 'MuxAvatar',
  slot: 'Root',
})('');

export interface AvatarProps extends React.ComponentProps<"img"> {
  variant?: variant;
  size?: size;
  className?: className;
  withBorder?: withBorder;
  color?: color;
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ variant, size, className, color, withBorder, ...rest }, ref) => {
    // 1. init
    const { avatar } = useTailwindTheme();
    const { valid, defaultProps, styles } = avatar;
    const { base, variants, sizes, borderColor } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    withBorder = withBorder ?? defaultProps.withBorder;
    color = color ?? defaultProps.color;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const avatarVariant = objectsToString(variants[findMatch(valid.variants, variant, "rounded")]);
    const avatarSize = objectsToString(sizes[findMatch(valid.sizes, size, "md")]);
    const avatarBorderColor = objectsToString(borderColor[findMatch(valid.colors, color, "gray")]);
    const classes = twMerge(
      classnames(objectsToString(base.initial), avatarVariant, avatarSize, {
        [objectsToString(base.withBorder)]: withBorder,
        [avatarBorderColor]: withBorder,
      }),
      className,
    );

    // 4. return
    return <img {...rest} ref={ref} className={classes} />;
  },
);

Avatar.displayName = "Mux.Avatar";

export default Avatar;
