import React from "react";
// types
import type { color } from "../../types/components/checkbox";
import {
  alpha,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  clsx,
  useMuiDefaultProps,
  SxThemeProps,
} from "../../styles";
import SwitchBase, { SwitchBaseProps } from "../internal/SwitchBase";
import { capitalize } from "../../utils";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import RadioButtonIcon from "./RadioButtonIcon";
import { OverridableStringUnion, StandardProps } from "../../props";
import { mapThemeColor } from "../../hooks";

export interface RadioClasses {
  /** State class applied to the root element if `checked={true}`. */
  checked: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
}

export type RadioClassKey = keyof RadioClasses;

export function getRadioUtilityClass(slot: string): string {
  return generateUtilityClass("MuxRadio", slot);
}

const radioClasses: RadioClasses = generateUtilityClasses("MuxRadio", [
  "checked",
  "disabled",
]);

const useUtilityClasses = (ownerState: any) => {
  const { classes, color, size } = ownerState;

  const slots = {
    root: [
      `color${capitalize(color)}`,
      size !== "md" && `size${capitalize(size)}`,
    ],
  };

  return {
    ...classes,
    ...composeClasses(slots, getRadioUtilityClass, classes),
  };
};

const RadioRoot = styled(SwitchBase, {
  shouldForwardProp: (prop) =>
    rootShouldForwardProp(prop) || prop === "classes",
  name: "MuxRadio",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.size !== "medium" &&
        styles[`size${capitalize(ownerState.size)}`],
      styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    [`&.${radioClasses.disabled}`]: {
      color: (theme.vars || theme).palette.action.disabled,
    },
    variants: [
      {
        props: ({ownerState}:any) => !ownerState.disabled && ownerState.ripple,
        style: {
          "&:hover": {
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})`
              : alpha(
                  theme.palette.action.active,
                  theme.palette.action.hoverOpacity,
                ),
            "@media (hover: none)": {
              backgroundColor: "transparent",
            },
          },
        },
      },
      {
        props: ({ ownerState }: any) =>
          !ownerState.disabled &&
          ownerState.ripple &&
          theme.palette.twColors?.includes(ownerState.color as any),
        style: ({ ownerState }: any) => ({
          [`&.${radioClasses.checked}`]: {
            "--tw-bg-opacity": theme.palette.action.hoverOpacity,
            backgroundColor: `rgb(var(--tw-${ownerState.color}-rgb) / var(--tw-bg-opacity))`,
          },
        }),
      },
      {
        props: ({ ownerState }: any) =>
          theme.palette.twColors?.includes(ownerState.color as any),
        style: ({ ownerState }: any) => ({
          [`&.${radioClasses.checked}`]: {
            "--tw-text-opacity": 1,
            color: `rgb(var(--tw-${ownerState.color}-rgb) / var(--tw-text-opacity))`,
          },
          [`&.${radioClasses.disabled}`]: {
            color: (theme.vars || theme).palette.action.disabled,
          },
        }),
      }
    ],
  })),
);

export interface RadioPropsSizeOverrides {}

export interface RadioPropsColorOverrides {}

export interface RadioProps
  extends StandardProps<
    SwitchBaseProps,
    RadioClassKey,
    "checkedIcon" | "color" | "icon" | "type"
  > {
  /**
   * The icon to display when the component is checked.
   * @default <RadioButtonIcon checked />
   */
  checkedIcon?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<RadioClasses>;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color?: color;
  /**
   * If `true`, the component is disabled.
   */
  disabled?: boolean;
  /**
   * The icon to display when the component is unchecked.
   * @default <RadioButtonIcon />
   */
  icon?: React.ReactNode;
  /**
   * The size of the component.
   * `small` is equivalent to the dense radio styling.
   * @default 'medium'
   */
  size?: OverridableStringUnion<"sm" | "md" | "lg", RadioPropsSizeOverrides>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  error?: boolean;
}

const defaultCheckedIcon = <RadioButtonIcon checked />;
const defaultIcon = <RadioButtonIcon />;

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(inProps, ref) {
    const props = useMuiDefaultProps({ props: inProps, name: "MuxRadio" });

    const {
      checked: checkedProp,
      checkedIcon = defaultCheckedIcon,
      color:inColor = "primary",
      icon = defaultIcon,
      name: nameProp,
      size = "md",
      className,
      disabled: disabledProp,
      ripple = true,
      rippleClassName,
      error,
      ...other
    } = props;

    let color = mapThemeColor(error ? "error" : inColor);
    const rippleClass = rippleClassName ?? `bg-${color ?? "primary"}`;

    let disabled = disabledProp;

    disabled ??= false;

    const ownerState = {
      ...props,
      disabled,
      ripple,
      color,
      size,
    };

    const classes = useUtilityClasses(ownerState);
    let checked = checkedProp;
    let name = nameProp;

    return (
      <RadioRoot
        type="radio"
        icon={React.cloneElement(icon as any, {
          size: defaultIcon.props.size ?? size,
        })}
        checkedIcon={React.cloneElement(checkedIcon as any, {
          size: defaultCheckedIcon.props.size ?? size,
        })}
        disabled={disabled}
        ownerState={ownerState}
        classes={classes}
        name={name}
        checked={checked}
        ref={ref}
        className={clsx(classes.root, className)}
        ripple={ripple}
        rippleClassName={rippleClass}
        {...other}
      />
    );
  },
);

Radio.displayName = "Mux.Radio";

export default Radio;
