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
  useMuxDefaultProps,
  clsx,
  composeClasses,
  generateUtilityClasses,
  generateUtilityClass,
  SxThemeProps,
  useTheme,
  useTailwindTheme,
  twx,
} from "../../styles";
import { capitalize } from "../../utils";
import { OverridableStringUnion, StandardProps } from "../../theme/tw/props";
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
  height: 18 + 10 * 2,
  overflow: "hidden",
  padding: 10,
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
        width: 76,
        height: 36 + 10 * 2,
        padding: 15,
        [`& .${switchClasses.thumb}`]: {
          width: 18,
          height: 18,
        },
        [`& .${switchClasses.track}`]: {
          height: 20,
        },
        [`& .${switchClasses.switchBase}`]: {
          padding: 16,
          [`&.${switchClasses.checked}`]: {
            transform: "translateX(26px)",
          },
        },
      },
    },
    {
      props: { size: "sm" },
      style: {
        width: 40,
        height: 18 + 7 * 2,
        padding: 7,
        [`& .${switchClasses.thumb}`]: {
          width: 12,
          height: 12,
        },
        [`& .${switchClasses.track}`]: {
          height: 14,
        },
        [`& .${switchClasses.switchBase}`]: {
          padding: 8,
          [`&.${switchClasses.checked}`]: {
            transform: "translateX(12px)",
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
    padding: 11,
    transition: "box-shadow,left,"+ theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
    [`&.${switchClasses.checked}`]: {
      transform: "translateX(20px)",
    },
    [`&.${switchClasses.disabled} .${switchClasses.thumb}`]: {
      boxShadow: "none",
    },
    [`&.${switchClasses.disabled} + .${switchClasses.track}`]: {
      backgroundColor: 'var(--act-disabled)',
      opacity: 'var(--switch-track-disabled)',
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
          color: twx.color(ownerState.color),
          [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
            backgroundColor: twx.color(ownerState.color),
          },
        }),
      },
      {
        props: ({ ownerState }: any) =>
          !ownerState.disabled && ownerState.ripple,
        style: {
          "&:hover": {
            backgroundColor: twx.alpha('act-active', 'var(--act-hover-opacity)'),
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
    height: 18,
    width: "100%",
    borderRadius: '999px',
    zIndex: -1,
    transition: theme.transitions.create(["opacity", "background-color"], {
      duration: theme.transitions.duration.shortest,
    }),
    backgroundColor: "var(--border)",
    [`&.${switchClasses.disabled}`]: {
      backgroundColor: 'var(--act-disabled)',
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
    backgroundColor: "var(--card)",
    width: 16,
    height: 16,
    borderRadius: "50%",
    variants: [
      {
        props: ({ ownerState }: any) =>
          !ownerState.disabled &&
          theme.palette.twColors?.includes(ownerState.color as any),
        style: ({ ownerState }: any) => ({
          [`&.${switchClasses.checked}`]: {
            borderColor: twx.color(ownerState.color),
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
    const props = useMuxDefaultProps({ props: inProps, name: "MuxSwitch" });
   
    
    const {
      className,
      error,
      color: inColor = "primary",
      edge = false,
      size =  "md",
      ripple = true,
      label,
      labelPosition,
      labelProps,
      boxProps,
      id = checkboxId,
      focusRipple = true,
      focusVisibleClassName="ring-2",
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
      hasColor: !other.disabled && color && theme.palette.twColors?.includes(color),
      focusRipple
    };

    const classes = useUtilityClasses(ownerState);
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
          focusRipple={focusRipple}
          data-ripple-color={ownerState.hasColor ? 'color' : undefined}
          className={
            classes.switchBase
          }
          focusVisibleClassName={focusVisibleClassName}
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
