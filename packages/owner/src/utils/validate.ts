

import { i18n, type DataContext, type Field, type FieldErrors } from ".";
import { toKebabCase } from "./names";

export type ValidationOptions = {
  props: Field;
  context: DataContext;
  touched?: boolean;
  focused?: boolean;
};

export type Validate = (
  value: any,
  options: ValidationOptions,
) => FieldErrors | undefined;

const isEmpty = (value: any) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const validateRequired: Validate = (value, { props, touched, focused }) => {
  const { title, required } = props;
  if ((touched && !focused) && required && isEmpty(value)) {
    return { required: i18n.get("{0} is required", title) };
  }
};

const validatePattern: Validate = (value, { props }) => {
  const { title, pattern, widget } = props;
  if (
    typeof value === "string" &&
    value &&
    ((["duration", "time"].includes(widget ?? "") && value?.includes?.("_")) ||
      (pattern && !new RegExp(pattern, "i").test(value)))
  ) {
    return { pattern: i18n.get("{0} is not in proper format", title) };
  }
};

const validateRange: Validate = (value, { props }) => {
  const { title, min, max } = props;
  if (min != null && value < +(min ?? 0)) {
    return { min: i18n.get("{0} is too small", title) };
  }
  if (max != null && value > +(max ?? 0)) {
    return { max: i18n.get("{0} is too big", title) };
  }
};

const validateString: Validate = (value, option) => {
  return (
    validateRequired(value, option) ||
    validatePattern(value, option) ||
    validateRange(value?.length, option)
  );
};

const validateNumber: Validate = (value, option) => {
  return (
    validateRequired(value, option) ||
    validateRange(value, option)
  );
};

export const Validators = {
  string: validateString,
  integer: validateNumber,
  long: validateNumber,
  decimal: validateNumber,
};

export const validate: Validate = (value, option) => {
  const {props} = option;

  let type = props?.pType ?? props?.type;

  if (props?.options) type = "select";

  const func = Validators[type as keyof typeof Validators];
  if (func) {
    return func(value, option);
  }

  const errors = validateRequired(value, option);
  if (errors) {
    return errors;
  }
};
