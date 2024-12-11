import React, {
  ChangeEventHandler,
  ForwardedRef,
  useCallback,
  useRef,
} from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";
import { useRipple } from "../../ripple";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  color,
  label,
  icon,
  ripple,
  className,
  disabled,
  objectType,
} from "../../types/components/checkbox";
import {
  alpha,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  useMuiDefaultProps,
} from "../../styles";
import { useControlled, useForwardedRef, mapThemeColor } from "../../hooks";
import CheckBoxOutlineBlankIcon from "../internal/svg-icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "../internal/svg-icons/CheckBox";
import IndeterminateCheckBoxIcon from "../internal/svg-icons/IndeterminateCheckBox";
import SwitchBase, { SwitchBaseProps } from "../internal/SwitchBase";
import { capitalize, clsx } from "../../utils";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";

export function getCheckboxUtilityClass(slot: string): string {
  return generateUtilityClass("Mux", slot);
}

const checkboxClasses = generateUtilityClasses('Mux', [
  'checked',
  'indeterminate',
  'disabled',
]);

const useUtilityClasses = (ownerState: any) => {
  const { classes, indeterminate, color, size } = ownerState;

  const slots = {
    root: [
      'root',
      indeterminate && "indeterminate",
      `color${capitalize(color)}`,
      `size${capitalize(size)}`,
    ],
  };

  const composedClasses = composeClasses(
    slots,
    getCheckboxUtilityClass,
    classes,
  );
  
  return {
    ...classes, // forward the disabled and checked classes to the SwitchBase
    ...composedClasses
  };
};

const CheckboxRoot = styled(SwitchBase, {
  name: "MuxCheckbox",
  shouldForwardProp: (prop) =>
    (rootShouldForwardProp(prop) || prop === 'classes'),
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      'root',
      ownerState.indeterminate && styles.indeterminate,
      styles[`size${capitalize(ownerState.size)}`],
      ownerState.color !== "default" &&
        styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
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
        props: ({ownerState}:any) => theme.palette.twColors?.includes(ownerState.color as any),
        style: ({ownerState}:any) => ({
          [`&.${checkboxClasses.checked}, &.${checkboxClasses.indeterminate}`]: {
            '--tw-text-opacity': 1,
            color: `rgb(var(--tw-${ownerState.color}-rgb) / var(--tw-text-opacity))`,
          },
          [`&.${checkboxClasses.disabled}`]: {
            color: (theme.vars || theme).palette.action.disabled,
          },
        }),
      },
    ],
  })),
);

const defaultCheckedIcon = <CheckBoxIcon />;
const defaultIcon = <CheckBoxOutlineBlankIcon />;
const defaultIndeterminateIcon = <IndeterminateCheckBoxIcon />;

export interface CheckboxProps extends SwitchBaseProps {
  color?: color;
  indeterminate?: boolean;
  indeterminateIcon?: React.ReactNode;
  error?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (inProps, ref) => {

    // 1. init
    const { checkbox } = useTailwindTheme();
    const { defaultProps, valid, styles } = checkbox;
    const { base, colors } = styles;
    let {
      color: inColor,
      error,
      ...others
    } = inProps;
    // 2. set default props
    let color = mapThemeColor(error ? "error" : inColor, defaultProps.color);

    const muiProps = useMuiDefaultProps({ props: inProps, name: 'MuxCheckbox' });

    let {
      indeterminate,
      indeterminateIcon: indeterminateIconProp = defaultIndeterminateIcon,
      checkedIcon = defaultCheckedIcon,
      icon: iconProp = defaultIcon,
      rippleClassName,
      ripple = defaultProps.ripple,
      labelProps = defaultProps.labelProps,
      className,
      size = defaultProps.size ?? 'md',
      inputProps,
      ...props
    } = muiProps;

    const rippleClass = rippleClassName ?? `bg-${color ?? "primary"}`;

    //const inputRef = useForwardedRef(ref);
    const ownerState = {
      ...props,
      indeterminate,
      color,
      size,
      ripple,
      error,
    };

    const icon = indeterminate ? indeterminateIconProp : iconProp;
    const indeterminateIcon = indeterminate
      ? indeterminateIconProp
      : checkedIcon;

    const classes = useUtilityClasses(ownerState);
    if(indeterminate){
      //console.log("classes:", classes)
    }
    return (
      <CheckboxRoot
        className={clsx(classes.root, className)}
        type="checkbox"
        inputProps={{
          //@ts-ignore
          "data-indeterminate": indeterminate,
          indeterminate: indeterminate ? 'true' : undefined,
          ...inputProps,
        }}
        icon={React.cloneElement(icon as any, {
          size: (icon as any).props?.fontSize ?? size,
        })}
        checkedIcon={React.cloneElement(indeterminateIcon as any, {
          size: (indeterminateIcon as any).props?.size ?? size,
        })}
        ownerState={ownerState}
        ref={ref}
        ripple={ripple}
        rippleClassName={rippleClass}
        labelProps={labelProps}
        {...props}
        print={props.checked}
      />
    );
  },
);

Checkbox.displayName = "Mux.Checkbox";

export default Checkbox;
