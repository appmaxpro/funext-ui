"use client";
// @inheritedComponent IconButton
import * as React from "react";
import { alpha, darken, lighten } from "@mui/system/colorManipulator";

import SwitchBase, {
  LabelRoot,
  SwitchBoxRoot,
  type SwitchBaseProps,
} from "../internal/SwitchBase";

import {
  styled,
  memoTheme,
  useMuiDefaultProps,
  clsx,
  composeClasses,
  generateUtilityClasses,
  generateUtilityClass,
  SxThemeProps,
  useTheme,
} from "../../styles";
import { capitalize } from "../../utils";
import { OverridableStringUnion, StandardProps } from "../../props";
import { mapThemeColor } from "../../hooks";
import { color } from "../../types/components/button";
export interface SwitchClasses {
  /** Styles applied to the root element if `edge="start"`. */
  edgeStart: string;
  /** Styles applied to the root element if `edge="end"`. */
  edgeEnd: string;
  /** Styles applied to the internal `SwitchBase` component's `root` class. */
  switchBase: string;
  /** State class applied to the internal `SwitchBase` component's `checked` class. */
  checked: string;
  /** State class applied to the internal SwitchBase component's disabled class. */
  disabled: string;
  /** Styles applied to the internal SwitchBase component's input element. */
  input: string;
  /** Styles used to create the thumb passed to the internal `SwitchBase` component `icon` prop. */
  thumb: string;
  /** Styles applied to the track element. */
  track: string;
}

export type SwitchClassKey = keyof SwitchClasses;

export function getSwitchUtilityClass(slot: string): string {
  return generateUtilityClass("MuxSwitch", slot);
}

const switchClasses: SwitchClasses = generateUtilityClasses("MuxSwitch", [
  "edgeStart",
  "edgeEnd",
  "switchBase",
  "checked",
  "disabled",
  "input",
  "thumb",
  "track",
  "size"
]);

const useUtilityClasses = (ownerState: any) => {
  const { classes, edge, size, color, hasColor, checked, disabled } = ownerState;

  const slots = {
    root: [
      edge && `edge${capitalize(edge)}`,
      `size${capitalize(size)}`,
    ],
    switchBase: [
      "switchBase",
      hasColor && `color${capitalize(color)}`,
      size && `size${capitalize(size)}`,
      checked && "checked",
      disabled && "disabled",

    ],
    thumb: ["thumb"],
    track: ["track"],
    input: ["input"],
  };

  const composedClasses = composeClasses(slots, getSwitchUtilityClass, classes);

  return {
    ...classes, // forward the disabled and checked classes to the SwitchBase
    ...composedClasses,
  };
};

const SwitchRoot = styled("span", {
  name: "MuxSwitch",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.edge && styles[`edge${capitalize(ownerState.edge)}`],
      styles[`size${capitalize(ownerState.size)}`],
    ];
  },
})({
  display: "inline-flex",
  width: 34 + 12 * 2,
  height: 14 + 12 * 2,
  overflow: "hidden",
  padding: 12,
  boxSizing: "border-box",
  position: "relative",
  flexShrink: 0,
  zIndex: 0, // Reset the stacking context.
  verticalAlign: "middle", // For correct alignment with the text.
  "@media print": {
    colorAdjust: "exact",
  },
  variants: [
    {
      props: { edge: "start" },
      style: { marginLeft: -8 },
    },
    {
      props: { edge: "end" },
      style: { marginRight: -8 },
    },
    {
      props: { size: "lg" },
      style: {
        width: 34 + 18 * 2,
        height: 14 + 18 * 2,
        padding: '18px 12px',
        [`& .${switchClasses.thumb}`]: {
          width: 24,
          height: 24,
        },
        [`& .${switchClasses.switchBase}`]: {
          padding: 11,
          [`&.${switchClasses.checked}`]: {
            transform: "translateX(24px)",
          },
        },
      },
    },
    {
      props: { size: "sm" },
      style: {
        width: 40,
        height: 24,
        padding: 7,
        [`& .${switchClasses.thumb}`]: {
          width: 16,
          height: 16,
        },
        [`& .${switchClasses.switchBase}`]: {
          padding: 4,
          [`&.${switchClasses.checked}`]: {
            transform: "translateX(16px)",
          },
        },
      },
    },
  ],
});

const SwitchSwitchBase = styled(SwitchBase, {
  name: "MuxSwitch",
  slot: "SwitchBase",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.switchBase,
      { [`& .${switchClasses.input}`]: styles.input },
      ownerState.hasColor &&
        styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1, // Render above the focus ripple.

    transition: theme.transitions.create(["left", "transform"], {
      duration: theme.transitions.duration.shortest,
    }),
    [`&.${switchClasses.checked}`]: {
      transform: "translateX(20px)",
    },
    [`&.${switchClasses.disabled} .${switchClasses.thumb}`]: {
      boxShadow: "none",
    },
    [`&.${switchClasses.disabled} + .${switchClasses.track}`]: {
      backgroundColor: (theme.vars || theme).palette.action.disabled,
      opacity: theme.vars
        ? theme.vars.opacity.switchTrackDisabled
        : `${theme.palette.mode === "light" ? 0.6 : 0.7}`,
    },
    [`& .${switchClasses.input}`]: {
      left: "-100%",
      width: "300%",
    },

    variants: [
      {
        props: {
          hasColor: true
        },
        style: ({ ownerState }: any) => ({
          color: `var(--tw-${ownerState.color})`,
          [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
            "--tw-bg-opacity": 1,
            backgroundColor: `rgb(var(--tw-${ownerState.color}-rgb) / var(--tw-bg-opacity))`,
          },
        }),
      },
      {
        props: ({ ownerState }: any) =>
          !ownerState.disabled && ownerState.ripple,
        style: {
          "&:hover": {
            backgroundColor: alpha(
              theme.palette.action.active,
              theme.palette.action.hoverOpacity,
            ),
            "@media (hover: none)": {
              backgroundColor: "transparent",
            },
          },
        },
      },
    ],
  })),
);

const SwitchTrack = styled("span", {
  name: "MuxSwitch",
  slot: "Track",
  overridesResolver: (props, styles) => styles.track,
})(
  memoTheme(({ theme }) => ({
    height: "100%",
    width: "100%",
    borderRadius: '999px',
    zIndex: -1,
    transition: theme.transitions.create(["opacity", "background-color"], {
      duration: theme.transitions.duration.shortest,
    }),
    backgroundColor: "var(--tw-hd-lg)",
    [`&.${switchClasses.disabled}`]: {
      backgroundColor: (theme.vars || theme).palette.action.disabled,
    },
  })),
);

const SwitchThumb = styled("span", {
  name: "MuxSwitch",
  slot: "Thumb",
  overridesResolver: (props, styles) => styles.thumb,
})(
  memoTheme(({ theme }) => ({
    boxShadow: (theme.vars || theme).shadows[1],
    backgroundColor: "var(--tw-body-bg)",
    width: 20,
    height: 20,
    borderRadius: "50%",
    variants: [
      {
        props: ({ ownerState }: any) =>
          !ownerState.disabled &&
          theme.palette.twColors?.includes(ownerState.color as any),
        style: ({ ownerState }: any) => ({
          [`&.${switchClasses.checked}`]: {
            "--tw-border-opacity": 1,
            borderColor: `rgb(var(--tw-${ownerState.color}-rgb) / var(--tw-border-opacity))`,
          },
        }),
      },
    ],
  })),
);

export interface SwitchPropsSizeOverrides {}

export interface SwitchPropsColorOverrides {}

export interface SwitchProps
  extends StandardProps<
    SwitchBaseProps,
    SwitchClassKey,
    "checkedIcon" | "color" | "icon"
  > {
  /**
   * The icon to display when the component is checked.
   */
  checkedIcon?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<SwitchClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: OverridableStringUnion<color,
    SwitchPropsColorOverrides
  >;
  /**
   * If `true`, the component is disabled.
   */
  disabled?: boolean;
  /**
   * The icon to display when the component is unchecked.
   */
  icon?: React.ReactNode;
  /**
   * The size of the component.
   * `small` is equivalent to the dense switch styling.
   * @default 'medium'
   */
  size?: OverridableStringUnion<"sm" | "md" | "lg", SwitchPropsSizeOverrides>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The value of the component. The DOM API casts this to a string.
   * The browser uses "on" as the default value.
   */
  value?: unknown;
  error?: boolean;
}

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  function Switch(inProps, ref) {
    const checkboxId = React.useId();
    const theme = useTheme();
    const props = useMuiDefaultProps({ props: inProps, name: "MuxSwitch" });
    const {
      className,
      error,
      color: inColor = "primary",
      edge = false,
      size = "md",
      ripple = true,
      label,
      labelPosition,
      labelProps,
      boxProps,
      id = checkboxId,
      sx,
      ...other
    } = props;

    let color = mapThemeColor(error ? "error" : inColor);

    const ownerState = {
      ...props,
      color,
      edge,
      size,
      ripple,
      hasColor: !other.disabled && color && theme.palette.twColors?.includes(color)
    };

    const classes = useUtilityClasses(ownerState);
    console.log("Switch :classes:", classes) 
    const icon = (
      <SwitchThumb className={classes.thumb} ownerState={ownerState} />
    );
    const switchChild = (
      <SwitchRoot
        className={clsx(classes.root, className)}
        sx={sx}
        ownerState={ownerState}
      >
        <SwitchSwitchBase
          type="checkbox"
          icon={icon}
          checkedIcon={icon}
          ref={ref}
          ownerState={ownerState}
          onClick={()=> {
            
          }}
          {...other}
          id={id}
          ripple={ripple}
          data-ripple-color={ownerState.hasColor ? 'color' : undefined}
          className={
            classes.switchBase
          }
        />
        <SwitchTrack className={clsx(classes.track, switchClasses.track)} ownerState={ownerState} />
      </SwitchRoot>
    );

    if (typeof label !== "string" && !React.isValidElement(label)) {
      return switchChild;
    }

    return (
      <SwitchBoxRoot {...boxProps}>
        {labelPosition === "before" && (
          <LabelRoot {...labelProps} htmlFor={id}>
            {label}
          </LabelRoot>
        )}
        {switchChild}
        {(!labelPosition || labelPosition === "after") && (
          <LabelRoot {...labelProps} htmlFor={id}>
            {label}
          </LabelRoot>
        )}
      </SwitchBoxRoot>
    );
  },
);

export default Switch;
