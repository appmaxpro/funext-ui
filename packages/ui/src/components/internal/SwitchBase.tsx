"use client";
import * as React from "react";
import refType from "@mui/utils/refType";
import {
  styled,
  clsx,
  composeClasses,
  generateUtilityClasses,
  generateUtilityClass,
} from "../../styles";
import { StandardProps } from "../../theme/tw/props";

import { ButtonBase, type ButtonBaseProps } from "../Button/ButtonBase";
import { capitalize } from "../../utils";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import { useControlled } from "../../hooks";

export interface SwitchBaseClasses {
  checked: string;
  disabled: string;
  input: string;
  edgeStart: string;
  edgeEnd: string;
}

export type SwitchBaseClassKey = keyof SwitchBaseClasses;

export function getSwitchBaseUtilityClass(slot: string): string {
  return generateUtilityClass("PrivateSwitchBase", slot);
}

export const switchBaseClasses: SwitchBaseClasses = generateUtilityClasses(
  "PrivateSwitchBase",
  ["checked", "disabled", "input", "edgeStart", "edgeEnd"],
);

const useUtilityClasses = (ownerState:any) => {
  const { classes, checked, disabled, edge } = ownerState;

  const slots = {
    root: [checked && 'checked', disabled && 'disabled', edge && `edge${capitalize(edge)}`],
    input: ['input'],
  };

  return composeClasses(slots, getSwitchBaseUtilityClass, classes);
};
export interface SwitchBaseProps
  extends StandardProps<
    Omit<ButtonBaseProps, "children" | "onChange" | "type" | "value" | "to">,
    SwitchBaseClassKey
  > {
  autoFocus?: boolean;
  /**
   * If `true`, the component is checked.
   */
  checked?: boolean;
  checkedIcon?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<SwitchBaseClasses>;
  /**
   * The default checked state. Use when the component is not controlled.
   */
  defaultChecked?: boolean;

  /**
   * If given, uses a negative margin to counteract the padding on one
   * side (this is often helpful for aligning the left or right
   * side of the icon with content above or below, without ruining the border
   * size and shape).
   * @default false
   */
  edge?: "start" | "end" | false;
  icon?: React.ReactNode;
  /**
   * The id of the `input` element.
   */
  id?: string;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /**
   * Pass a ref to the `input` element.
   */
  inputRef?: React.Ref<any>;
  /**
   * Name attribute of the `input` element.
   */
  name?: string;
  /**
   * Callback fired when the state is changed.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * You can pull out the new value by accessing `event.target.value` (string).
   * You can pull out the new checked state by accessing `event.target.checked` (boolean).
   */
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  readOnly?: boolean;
  /**
   * If `true`, the `input` element is required.
   * @default false
   */
  required?: boolean;
  tabIndex?: number;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  /**
   * The value of the component. The DOM API casts this to a string.
   */
  value?: unknown;
  label?: React.ReactNode;
  labelProps?: React.InputHTMLAttributes<HTMLLabelElement>;
  boxProps?: React.InputHTMLAttributes<HTMLDivElement>;
  labelPosition?: "before" | "after";
  print?: boolean;
}



export const SwitchBoxRoot = styled("div", {
  name: "MuxSwitchBox",
  overridesResolver: (props: any, styles: any) => styles.root,
})({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  variants: [
    {
      props: {
        labelPosition: "before"
      },
      style: {
        justifyContent: 'space-between',
        flexGrow: 1
      },
    },
  ]
});

export const LabelRoot = styled("label", {
  name: "MuxSwitchLabel",
  overridesResolver: (props: any, styles: any) => styles.root,
})({
  userSelect: "none",
  cursor: "pointer",
  fontWeight: 400,
  
});

const SwitchBaseRoot = styled(ButtonBase)({
  padding: 9,
  borderRadius: "50%",
  variants: [
    {
      props: {
        edge: "start",
        size: "sm",
      },
      style: {
        marginLeft: -3,
      },
    },
    {
      props: ({ edge, ownerState }: any) =>
        edge === "start" && ownerState.size !== "sm",
      style: {
        marginLeft: -12,
      },
    },
    {
      props: {
        edge: "end",
        size: "sm",
      },
      style: {
        marginRight: -3,
      },
    },
    {
      props: ({ edge, ownerState }: any) =>
        edge === "end" && ownerState.size !== "sm",
      style: {
        marginRight: -12,
      },
    }
  ],
});

const SwitchBaseInput = styled("input", {
  shouldForwardProp: rootShouldForwardProp,
})({
  cursor: "inherit",
  position: "absolute",
  opacity: 0,
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  margin: 0,
  padding: 0,
  zIndex: 1,
});

/**
 * @ignore - internal component.
 */
const SwitchBase = React.forwardRef<HTMLElement, SwitchBaseProps>(
  function SwitchBase(props, ref) {
    const checkboxId = React.useId();
    const {
      autoFocus,
      checked: isChecked,
      checkedIcon,
      className,
      defaultChecked,
      disabled: disabledProp,
      ripple,
      focusRipple,
      edge = false,
      icon,
      id = checkboxId,
      inputProps,
      inputRef,
      name,
      onBlur,
      onChange,
      onFocus,
      readOnly,
      required = false,
      tabIndex,
      type,
      value,
      label,
      labelProps,
      boxProps,
      labelPosition,
      print,
      classes:inClasses,
      rippleProps,
      ...other
    } = props as SwitchBaseProps;

    const [checked, setCheckedState] = useControlled({
      name: "SwitchBase",
      prop: "checked",
      state: isChecked,
      defaultState: defaultChecked,
    });

    const handleFocus = (event: any) => {
      if (onFocus) {
        onFocus(event);
      }
    };

    const handleBlur = (event: any) => {
      if (onBlur) {
        onBlur(event);
      }
    };

    const handleInputChange = (event: any) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      if(readOnly){
        event.preventDefault();
        return;
      }

      const newChecked = event.target.checked;

      setCheckedState(newChecked);

      if (onChange) {
        // TODO v6: remove the second argument.
        onChange(event, newChecked);
      }
    };

    let disabled = disabledProp;

    const hasLabelFor = type === "checkbox" || type === "radio";

    const memoRippleProps = React.useMemo(()=> ({
      animation: {
        enterDuration: 500,
        exitDuration: 400
      },
       ...rippleProps,  
    }), [rippleProps])

    const ownerState = {
      ...props,
      checked,
      disabled,
      ripple,
      focusRipple,
      edge,
      labelPosition
    };

    const classes = useUtilityClasses(ownerState);


    const switchChild = (
      <SwitchBaseRoot
        component="span"
        className={clsx(classes.root, className)}
        centerRipple
        ripple={ripple}
        focusRipple={focusRipple}
        disabled={disabled}
        tabIndex={null as any}
        role={undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ownerState={ownerState}
        ref={ref as any}
        rippleProps={memoRippleProps}
        {...other}
      >
        <SwitchBaseInput
          autoFocus={autoFocus}
          checked={isChecked}
          defaultChecked={defaultChecked}
          className={classes.input}
          disabled={disabled}
          id={id}
          name={name}
          onChange={handleInputChange}
          readOnly={readOnly}
          ref={inputRef}
          required={required}
          ownerState={ownerState}
          tabIndex={tabIndex}
          type={type}
          {...(type === "checkbox" && value === undefined
            ? {}
            : { value: value as any })}
          {...inputProps}
        />
        {checked ? checkedIcon : icon}
      </SwitchBaseRoot>
    );
    if (typeof label !== 'string' && !React.isValidElement(label)) {
      return switchChild;
    }

    return (
      <SwitchBoxRoot {...boxProps} ownerState={ownerState}>
        {(labelPosition === "before") && (
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

export default SwitchBase;
