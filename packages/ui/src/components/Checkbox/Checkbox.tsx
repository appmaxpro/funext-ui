import React, {
  ChangeEventHandler,
  ForwardedRef,
  useCallback,
  useRef,
} from "react";

// utils

import {
  alpha,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  twx,
  useMuxDefaultProps,
} from "../../styles";
import { useControlled, useForwardedRef, mapThemeColor } from "../../hooks";
import CheckBoxOutlineBlankIcon from "../internal/svg-icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "../internal/svg-icons/CheckBox";
import IndeterminateCheckBoxIcon from "../internal/svg-icons/IndeterminateCheckBox";
import SwitchBase, { SwitchBaseProps } from "../internal/SwitchBase";
import { capitalize, clsx } from "../../utils";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import { Colors } from "../../types";

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
    color: 'var(--muted-fg)',
    [`&.${checkboxClasses.disabled}`]: {
      color: 'var(--act-disabled)',
    },
    variants: [
      {
        props: ({ownerState}:any) => !ownerState.disabled && ownerState.ripple,
        style: {
          "&:hover": {
            backgroundColor: twx.alpha('act-active', 'var(--act-hover-opacity)'),
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
            color: twx.color(ownerState.color),
          },
          [`&.${checkboxClasses.disabled}`]: {
            color: 'var(--act-disabled)',
          },
        }),
      },
      {
        props: {
          color: 'inherit'
        },
        style: {
          color: 'inherit'
        },
      },
    ],
  })),
);

const defaultCheckedIcon = <CheckBoxIcon />;
const defaultIcon = <CheckBoxOutlineBlankIcon />;
const defaultIndeterminateIcon = <IndeterminateCheckBoxIcon />;

export interface CheckboxProps extends SwitchBaseProps {
  color?: Colors | 'inherit';
  indeterminate?: boolean;
  indeterminateIcon?: React.ReactNode;
  error?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (inProps, ref) => {


    let {
      color: inColor,
      error,
      ...others
    } = inProps;
    // 2. set default props
    let color = mapThemeColor(error ? "error" : inColor, 'primary');

    const muiProps = useMuxDefaultProps({ props: inProps, name: 'MuxCheckbox' });

    let {
      indeterminate,
      indeterminateIcon: indeterminateIconProp = defaultIndeterminateIcon,
      checkedIcon = defaultCheckedIcon,
      icon: iconProp = defaultIcon,
      ripple = true,
      labelProps,
      focusRipple = true,
      focusVisibleClassName="ring-2",
      className,
      size = 'md',
      inputProps,
      ...props
    } = muiProps;


    //const inputRef = useForwardedRef(ref);
    const ownerState = {
      ...props,
      focusRipple,
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
        focusVisibleClassName={focusVisibleClassName}
        focusRipple={focusRipple}
        labelProps={labelProps}
        {...props}
        print={props.checked}
      />
    );
  },
);

Checkbox.displayName = "Mux.Checkbox";

export default Checkbox;
