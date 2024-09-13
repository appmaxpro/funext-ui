'use client';
import * as React from 'react';
import refType from '@mui/utils/refType';
import { 
  styled, 
  clsx,  
  composeClasses, 
  generateUtilityClasses ,
  generateUtilityClass ,
} from '../../styles';
import {StandardProps} from '../../props';

import {ButtonBase, type ButtonBaseProps} from '../Button/ButtonBase';
import { capitalize } from '../../utils';
import rootShouldForwardProp from '../../styles/rootShouldForwardProp';
import { useControlled } from '../../hooks';


export interface SwitchBaseClasses {
  root: string;
  checked: string;
  disabled: string;
  input: string;
  edgeStart: string;
  edgeEnd: string;
}

export type SwitchBaseClassKey = keyof SwitchBaseClasses;

export function getSwitchBaseUtilityClass(slot: string): string {
  return generateUtilityClass('PrivateSwitchBase', slot);
}

export const switchBaseClasses: SwitchBaseClasses = generateUtilityClasses('PrivateSwitchBase', [
  'root',
  'checked',
  'disabled',
  'input',
  'edgeStart',
  'edgeEnd',
]);


export interface SwitchBaseProps
  extends StandardProps<Omit<ButtonBaseProps, 'children' | 'onChange' | 'type' | 'value'>, SwitchBaseClassKey> {
  autoFocus?: boolean;
  /**
   * If `true`, the component is checked.
   */
  checked?: boolean;
  checkedIcon: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<SwitchBaseClasses>;
  /**
   * The default checked state. Use when the component is not controlled.
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the component is disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the ripple effect is disabled.
   * @default false
   */
  disableRipple?: boolean;
  /**
   * If `true`, the  keyboard focus ripple is disabled.
   * @default false
   */
  disableFocusRipple?: boolean;
  /**
   * If given, uses a negative margin to counteract the padding on one
   * side (this is often helpful for aligning the left or right
   * side of the icon with content above or below, without ruining the border
   * size and shape).
   * @default false
   */
  edge?: 'start' | 'end' | false;
  icon: React.ReactNode;
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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  readOnly?: boolean;
  /**
   * If `true`, the `input` element is required.
   * @default false
   */
  required?: boolean;
  tabIndex?: number;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  /**
   * The value of the component. The DOM API casts this to a string.
   */
  value?: unknown;
}

const useUtilityClasses = (ownerState:any) => {
  const { classes, checked, disabled, edge } = ownerState;

  const slots = {
    root: ['root', checked && 'checked', disabled && 'disabled', edge && `edge${capitalize(edge)}`],
    input: ['input'],
  };

  return composeClasses(slots, getSwitchBaseUtilityClass, classes);
};

const SwitchBaseRoot = styled(ButtonBase)({
  padding: 9,
  borderRadius: '50%',
  variants: [
    {
      props: {
        edge: 'start',
        size: 'sm',
      },
      style: {
        marginLeft: -3,
      },
    },
    {
      props: ({ edge, ownerState }:any) => edge === 'start' && ownerState.size !== 'sm',
      style: {
        marginLeft: -12,
      },
    },
    {
      props: {
        edge: 'end',
        size: 'sm',
      },
      style: {
        marginRight: -3,
      },
    },
    {
      props: ({ edge, ownerState }:any) => edge === 'end' && ownerState.size !== 'sm',
      style: {
        marginRight: -12,
      },
    },
  ],
});

const SwitchBaseInput = styled('input', { shouldForwardProp: rootShouldForwardProp })({
  cursor: 'inherit',
  position: 'absolute',
  opacity: 0,
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  margin: 0,
  padding: 0,
  zIndex: 1,
});

/**
 * @ignore - internal component.
 */
const SwitchBase = React.forwardRef<HTMLElement, SwitchBaseProps>(function SwitchBase(props, ref) {
  const {
    autoFocus,
    checked: isChecked,
    checkedIcon,
    className,
    defaultChecked,
    disabled: disabledProp,
    disableFocusRipple = false,
    edge = false,
    icon,
    id,
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
    ...other
  } = props as SwitchBaseProps;

  const [checked, setCheckedState] = useControlled({
    name: 'SwitchBase',
    prop: 'checked',
    state: isChecked,
    defaultState: defaultChecked
 })


  const handleFocus = (event:any) => {
    if (onFocus) {
      onFocus(event);
    }

  };

  const handleBlur = (event:any) => {
    if (onBlur) {
      onBlur(event);
    }
  };

  const handleInputChange = (event:any) => {
    // Workaround for https://github.com/facebook/react/issues/9023
    if (event.nativeEvent.defaultPrevented) {
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

  const hasLabelFor = type === 'checkbox' || type === 'radio';

  const ownerState = {
    ...props,
    checked,
    disabled,
    disableFocusRipple,
    edge,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <SwitchBaseRoot
      component="span"
      className={clsx(classes.root, className)}
      centerRipple
      focusRipple={!disableFocusRipple}
      disabled={disabled}
      tabIndex={null as any}
      role={undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ownerState={ownerState}
      ref={ref as any}
      {...other}
    >
      <SwitchBaseInput
        autoFocus={autoFocus}
        checked={isChecked}
        defaultChecked={defaultChecked}
        className={classes.input}
        disabled={disabled}
        id={hasLabelFor ? id : undefined}
        name={name}
        onChange={handleInputChange}
        readOnly={readOnly}
        ref={inputRef}
        required={required}
        ownerState={ownerState}
        tabIndex={tabIndex}
        type={type}
        {...(type === 'checkbox' && value === undefined ? {} : { value: value as any})}
        {...inputProps}
      />
      {checked ? checkedIcon : icon}
    </SwitchBaseRoot>
  );
});


export default SwitchBase;