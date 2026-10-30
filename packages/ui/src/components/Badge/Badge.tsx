"use client";
import React from "react";
import {
  clsx,
  composeClasses,
  memoTheme,
  styled,
  useMuxDefaultProps,
  useSlot,
} from "../../styles";
import { capitalize } from "../../utils";
import badgeClasses, { getBadgeUtilityClass } from "./badgeClasses";
import { BadgeOrigin, BadgeOwnerState, BadgeProps } from "./types";
import useBadge from "./useBadge";
import { usePrevious } from "../../hooks";

const RADIUS_STANDARD = 10;
const RADIUS_DOT = 4;

type OwnerStateProps = { ownerState: BadgeOwnerState };

const useUtilityClasses = (ownerState: any) => {
  const {
    color,
    placement,
    invisible,
    shape,
    variant,
    classes = {},
  } = ownerState;

  const slots = {
    root: ["root"],
    badge: [
      "badge",
      variant,
      invisible && "invisible",
      color !== "default" && `color${capitalize(color)}`,
    ],
  };

  return composeClasses(slots, getBadgeUtilityClass, classes);
};

const BadgeRoot = styled("span", {
  name: "MuiBadge",
  slot: "Root",
})({
  position: "relative",
  display: "inline-flex",
  // For correct alignment with the text.
  verticalAlign: "middle",
  flexShrink: 0,
});

const BadgeBadge = styled("span", {
  name: "MuiBadge",
  slot: "Badge",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.badge,
      styles[ownerState.variant],
      styles[
        `placement${capitalize(ownerState.placement.vertical)}${capitalize(
          ownerState.placement.horizontal,
        )}${capitalize(ownerState.shape)}`
      ],
      ownerState.color !== "default" &&
        styles[`color${capitalize(ownerState.color)}`],
      ownerState.invisible && styles.invisible,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    position: "absolute",
    boxSizing: "border-box",
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(12),
    minWidth: RADIUS_STANDARD * 2,
    lineHeight: 1,
    padding: "0 6px",
    height: RADIUS_STANDARD * 2,
    borderRadius: RADIUS_STANDARD,
    
    zIndex: 1, // Render the badge on top of potential ripples.
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),

    "&[data-square-top-right]": {
      top: 0,
      right: 0,
      transform: "scale(1) translate(50%, -50%)",
      transformOrigin: "100% 0%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(50%, -50%)",
      },
    },
    "&[data-square-bottom-right]": {
      bottom: 0,
      right: 0,
      transform: "scale(1) translate(50%, 50%)",
      transformOrigin: "100% 100%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(50%, 50%)",
      },
    },
    "&[data-square-top-left]": {
      top: 0,
      left: 0,
      transform: "scale(1) translate(-50%, -50%)",
      transformOrigin: "0% 0%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(-50%, -50%)",
      },
    },
    "&[data-square-bottom-left]": {
      bottom: 0,
      left: 0,
      transform: "scale(1) translate(-50%, 50%)",
      transformOrigin: "0% 100%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(-50%, 50%)",
      },
    },
    "&[data-circle-top-right]": {
      top: "14%",
      right: "14%",
      transform: "scale(1) translate(50%, -50%)",
      transformOrigin: "100% 0%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(50%, -50%)",
      },
    },
    "&[data-circle-bottom-right]": {
      bottom: "14%",
      right: "14%",
      transform: "scale(1) translate(50%, 50%)",
      transformOrigin: "100% 100%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(50%, 50%)",
      },
    },
    "&[data-circle-top-left]": {
      top: "14%",
      left: "14%",
      transform: "scale(1) translate(-50%, -50%)",
      transformOrigin: "0% 0%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(-50%, -50%)",
      },
    },
    "&[data-circle-bottom-left]": {
      bottom: "14%",
      left: "14%",
      transform: "scale(1) translate(-50%, 50%)",
      transformOrigin: "0% 100%",
      [`&.${badgeClasses.invisible}`]: {
        transform: "scale(0) translate(-50%, 50%)",
      },
    },

    variants: [
      ...Object.entries(theme.palette)
        .filter(([color, value]) => value.contrastText)
        .map(([color, value]) => ({
          props: { color },
          style: {
            backgroundColor: value.main,
            color: value.contrastText,
          },
        })),
      {
        props: { variant: "dot" },
        style: {
          borderRadius: RADIUS_DOT,
          height: RADIUS_DOT * 2,
          minWidth: RADIUS_DOT * 2,
          padding: 0,
        },
      },

      {
        props: { invisible: true },
        style: {
          visibility: 'hidden',
          transition: theme.transitions.create("transform", {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      },
    ],
  })),
);

function getAnchorOrigin(placement?: BadgeOrigin) {
  return {
    vertical: placement?.vertical ?? "top",
    horizontal: placement?.horizontal ?? "right",
  };
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(inProps, ref) {
    const props = useMuxDefaultProps({ props: inProps, name: "MuxBadge" });
    const {
      placement: placementProp,
      className,
      classes: classesProp,
      component,
      components = {},
      componentsProps = {},
      children,
      shape: shapeProp = "circle",
      color: colorProp = "default",
      invisible: invisibleProp = false,
      max: maxProp = 99,
      content: badgeContentProp,
      slots,
      slotProps,
      showZero = false,
      variant: variantProp = "standard",
      ...other
    } = props;

    const {
      content,
      invisible: invisibleFromHook,
      max,
      displayValue: displayValueFromHook,
    } = useBadge({
      max: maxProp,
      invisible: invisibleProp,
      content: badgeContentProp,
      showZero,
    });

    const prevProps = usePrevious({
      placement: getAnchorOrigin(placementProp),
      color: colorProp,
      shape: shapeProp,
      variant: variantProp,
      content: badgeContentProp,
    });

    const invisible =
      invisibleFromHook || (content == null && variantProp !== "dot");

    const {
      color = colorProp,
      shape = shapeProp,
      placement: placementPropProp,
      variant = variantProp,
    } = invisible ? prevProps : props;

    const placement = getAnchorOrigin(placementPropProp);
    const displayValue = variant !== "dot" ? displayValueFromHook : undefined;

    const ownerState = {
      ...props,
      content,
      invisible,
      max,
      displayValue,
      showZero,
      placement,
      color,
      shape,
      variant,
    };

    const classes = useUtilityClasses(ownerState);

    // support both `slots` and `components` for backward compatibility
    const externalForwardedProps = {
      slots: {
        root: slots?.root ?? components.Root,
        badge: slots?.badge ?? components.Badge,
      },
      slotProps: {
        root: slotProps?.root ?? componentsProps.root,
        badge: slotProps?.badge ?? componentsProps.badge,
      },
    };

    const [RootSlot, rootProps] = useSlot("root", {
      elementType: BadgeRoot,
      externalForwardedProps: {
        ...externalForwardedProps,
        ...other,
      },
      ownerState,
      className: clsx(classes.root, className),
      ref,
      additionalProps: {
        as: component,
      },
    });

    const [BadgeSlot, badgeProps] = useSlot("badge", {
      elementType: BadgeBadge,
      externalForwardedProps,
      ownerState,
      className: classes.badge,
    });
    const dataProps = {
      [`data-${shape}-${placement.vertical}-${placement.horizontal}`]: ''
    }
    return (
      <RootSlot {...rootProps}
          {...dataProps}
      >
        {children}
        <BadgeSlot {...badgeProps}>{displayValue}</BadgeSlot>
      </RootSlot>
    );
  },
);

export default Badge;
