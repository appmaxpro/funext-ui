'use client';
import React from "react";
import {
  clsx,
  composeClasses,
  memoTheme,
  styled,
  useMuxDefaultProps,
  useSlot
} from "../../styles";
import { capitalize } from "../../utils";
import badgeClasses, { getBadgeUtilityClass } from "./badgeClasses";
import { BadgeOrigin, BadgeOwnerState, BadgeProps } from "./types";
import useBadge from "./useBadge";
import { usePrevious } from "../../hooks";


const RADIUS_STANDARD = 10;
const RADIUS_DOT = 4;

type OwnerStateProps = {ownerState: BadgeOwnerState}

const useUtilityClasses = (ownerState:any) => {
  const { color, anchorOrigin, invisible, overlap, variant, classes = {} } = ownerState;

  const slots = {
    root: ['root'],
    badge: [
      'badge',
      variant,
      invisible && 'invisible',
      `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}`,
      `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(
        anchorOrigin.horizontal,
      )}${capitalize(overlap)}`,
      `overlap${capitalize(overlap)}`,
      color !== 'default' && `color${capitalize(color)}`,
    ],
  };

  return composeClasses(slots, getBadgeUtilityClass, classes);
};

const BadgeRoot = styled('span', {
  name: 'MuiBadge',
  slot: 'Root',
})({
  position: 'relative',
  display: 'inline-flex',
  // For correct alignment with the text.
  verticalAlign: 'middle',
  flexShrink: 0,
});

const BadgeBadge = styled('span', {
  name: 'MuiBadge',
  slot: 'Badge',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.badge,
      styles[ownerState.variant],
      styles[
        `anchorOrigin${capitalize(ownerState.anchorOrigin.vertical)}${capitalize(
          ownerState.anchorOrigin.horizontal,
        )}${capitalize(ownerState.overlap)}`
      ],
      ownerState.color !== 'default' && styles[`color${capitalize(ownerState.color)}`],
      ownerState.invisible && styles.invisible,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    boxSizing: 'border-box',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(12),
    minWidth: RADIUS_STANDARD * 2,
    lineHeight: 1,
    padding: '0 6px',
    height: RADIUS_STANDARD * 2,
    borderRadius: RADIUS_STANDARD,
    zIndex: 1, // Render the badge on top of potential ripples.
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
        props: { variant: 'dot' },
        style: {
          borderRadius: RADIUS_DOT,
          height: RADIUS_DOT * 2,
          minWidth: RADIUS_DOT * 2,
          padding: 0,
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'top' &&
          ownerState.anchorOrigin.horizontal === 'right' &&
          ownerState.overlap === 'rectangular',
        style: {
          top: 0,
          right: 0,
          transform: 'scale(1) translate(50%, -50%)',
          transformOrigin: '100% 0%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(50%, -50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'bottom' &&
          ownerState.anchorOrigin.horizontal === 'right' &&
          ownerState.overlap === 'rectangular',
        style: {
          bottom: 0,
          right: 0,
          transform: 'scale(1) translate(50%, 50%)',
          transformOrigin: '100% 100%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(50%, 50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'top' &&
          ownerState.anchorOrigin.horizontal === 'left' &&
          ownerState.overlap === 'rectangular',
        style: {
          top: 0,
          left: 0,
          transform: 'scale(1) translate(-50%, -50%)',
          transformOrigin: '0% 0%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(-50%, -50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'bottom' &&
          ownerState.anchorOrigin.horizontal === 'left' &&
          ownerState.overlap === 'rectangular',
        style: {
          bottom: 0,
          left: 0,
          transform: 'scale(1) translate(-50%, 50%)',
          transformOrigin: '0% 100%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(-50%, 50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'top' &&
          ownerState.anchorOrigin.horizontal === 'right' &&
          ownerState.overlap === 'circular',
        style: {
          top: '14%',
          right: '14%',
          transform: 'scale(1) translate(50%, -50%)',
          transformOrigin: '100% 0%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(50%, -50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'bottom' &&
          ownerState.anchorOrigin.horizontal === 'right' &&
          ownerState.overlap === 'circular',
        style: {
          bottom: '14%',
          right: '14%',
          transform: 'scale(1) translate(50%, 50%)',
          transformOrigin: '100% 100%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(50%, 50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'top' &&
          ownerState.anchorOrigin.horizontal === 'left' &&
          ownerState.overlap === 'circular',
        style: {
          top: '14%',
          left: '14%',
          transform: 'scale(1) translate(-50%, -50%)',
          transformOrigin: '0% 0%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(-50%, -50%)',
          },
        },
      },
      {
        props: ({ ownerState }:OwnerStateProps) =>
          ownerState.anchorOrigin.vertical === 'bottom' &&
          ownerState.anchorOrigin.horizontal === 'left' &&
          ownerState.overlap === 'circular',
        style: {
          bottom: '14%',
          left: '14%',
          transform: 'scale(1) translate(-50%, 50%)',
          transformOrigin: '0% 100%',
          [`&.${badgeClasses.invisible}`]: {
            transform: 'scale(0) translate(-50%, 50%)',
          },
        },
      },
      {
        props: { invisible: true },
        style: {
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      },
    ],
  })),
);

function getAnchorOrigin(anchorOrigin?:BadgeOrigin) {
  return {
    vertical: anchorOrigin?.vertical ?? 'top',
    horizontal: anchorOrigin?.horizontal ?? 'right',
  };
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxBadge' });
  const {
    anchorOrigin: anchorOriginProp,
    className,
    classes: classesProp,
    component,
    components = {},
    componentsProps = {},
    children,
    overlap: overlapProp = 'rectangular',
    color: colorProp = 'default',
    invisible: invisibleProp = false,
    max: maxProp = 99,
    badgeContent: badgeContentProp,
    slots,
    slotProps,
    showZero = false,
    variant: variantProp = 'standard',
    ...other
  } = props;

  const {
    badgeContent,
    invisible: invisibleFromHook,
    max,
    displayValue: displayValueFromHook,
  } = useBadge({
    max: maxProp,
    invisible: invisibleProp,
    badgeContent: badgeContentProp,
    showZero,
  });

  const prevProps = usePrevious({
    anchorOrigin: getAnchorOrigin(anchorOriginProp),
    color: colorProp,
    overlap: overlapProp,
    variant: variantProp,
    badgeContent: badgeContentProp,
  });

  const invisible = invisibleFromHook || (badgeContent == null && variantProp !== 'dot');

  const {
    color = colorProp,
    overlap = overlapProp,
    anchorOrigin: anchorOriginPropProp,
    variant = variantProp,
  } = invisible ? prevProps : props;

  const anchorOrigin = getAnchorOrigin(anchorOriginPropProp);
  const displayValue = variant !== 'dot' ? displayValueFromHook : undefined;

  const ownerState = {
    ...props,
    badgeContent,
    invisible,
    max,
    displayValue,
    showZero,
    anchorOrigin,
    color,
    overlap,
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

  const [RootSlot, rootProps] = useSlot('root', {
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

  const [BadgeSlot, badgeProps] = useSlot('badge', {
    elementType: BadgeBadge,
    externalForwardedProps,
    ownerState,
    className: classes.badge,
  });

  return (
    <RootSlot {...rootProps}>
      {children}
      <BadgeSlot {...badgeProps}>{displayValue}</BadgeSlot>
    </RootSlot>
  );
});


export default Badge;