import { Input } from "@funext/ui";

import {
  FieldControl,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "./root";

import { DEFAULT_SCALE, EMPTY_ARRAY, i18n, type Field } from "~/utils";
import format from "~/utils/format";
import type { IFieldState, IFState } from "../../../types";
import { registerWidgets, useInput } from "./hooks";
import { getWidgetStateForm } from "~/scope/utils";
import get from "lodash/get";
import React from "react";

import convert from "~/utils/convert";
import type { FieldProps } from "./types";
import { duration } from "dayjs";
const NUM_PATTERN = /^(-)?\d*(\.(\d+)?)?$/;

const isNumberLike = (text: string) => NUM_PATTERN.test(text);

const useNumber = (field: IFieldState, pType: string) => {
  const block = field.block;
  const schema = block.schema;
  const { scale: scaleAttr } = schema;
  const type = schema.widget ?? schema.pType;
  const isDecimal = type === "decimal";
  const scaleNum = React.useMemo(() => {
    if (!isDecimal) {
      return 0;
    }
    if (typeof scaleAttr === "number") {
      return Math.floor(scaleAttr);
    }
    if (schema.scale == null || scaleAttr === "") {
      return DEFAULT_SCALE;
    }
    return parseInt(String(scaleAttr));
  }, EMPTY_ARRAY);

  const scale = React.useMemo(() => {
    if (!isNaN(scaleNum)) {
      return scaleNum;
    }
    const form = getWidgetStateForm(field)!;
    const value = parseInt(get(form.record, scaleAttr ?? ""));
    return isNaN(value) ? DEFAULT_SCALE : value;
  }, [scaleAttr, scaleNum]);

  const parse = React.useCallback(
    (value?: string | number | null) =>
      convert(value, { props: { ...schema, scale } }),
    [schema, scale],
  );

  const { value, setChanged, onChange, onFocus, onBlur, onKeyDown } = useInput(
    field,
    {
      validate: isNumberLike,
      parse,
      format: parse,
    },
  );

  const text = React.useMemo(
    () =>
      value != null
        ? format(value, {
            props: { ...schema, ...field.state.props, pType, scale } as Field,
            context: getWidgetStateForm(field)!.context,
          })
        : "",
    [value, pType, scale],
  );

  return {
    text,
    value,
    setChanged,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
  };
};

const useTextInput = (field: IFieldState, pType: string, type?: string) =>
  type === "number" ? useNumber(field, pType) : useInput(field);

const InputField = ({ state, field, id, type: typeProp }: FieldProps) => {
  const block = field.block;
  const schema = block.schema;

  const { required, props, readonly } = state;

  const { pType, widget } = schema;
  const type = mapping[typeProp as keyof typeof mapping];

  const { value, text, onChange, onFocus, onBlur, onKeyDown } = useTextInput(
    field,
    typeProp ?? pType!,
    type,
  );

  //const value = field.value;
  console.log("InputField:: ", {
    field: field,
    value,
    fmt: format(value, { props: schema, context: field.context }),
    required,
    props,
    readonly,
  });

  return (
    <FieldControl field={field} state={state}>
      <Input
        type={typeProp === 'duration' ? 'text' : type}
        placeholder={schema.placeholder}
        {...props}
        name={schema.name}
        required={required}
        readOnly={readonly}
        as={pType === "text" ? "textarea" : undefined}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        disableBorder={getWidgetStateForm(field)?.readOnly}
        id={id}
      />
    </FieldControl>
  );
};

const mapping = {
  string: "text",
  int: "number",
  float: "number",
  decimal: "number",
  percent: "number",
  duration: "number",
  email: "email",
  password: "password",
};

registerWidgets({
  text: InputField,
  string: InputField,
  int: InputField,
  float: InputField,
  decimal: InputField,
  percent: InputField,
  duration: InputField,
  email: InputField,
  password: InputField,

});
