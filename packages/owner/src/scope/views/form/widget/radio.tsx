"use client";

import { useCallback, useMemo } from "react";

import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  getMultiValues,
  type Option
} from "~/utils";

import { cn, Radio } from "~/ui";
import { registerWidgets } from "./hooks";
import {
  FieldControl
} from "./root";
import type { FieldProps } from "./types";

export const RadioField = ({
  state,
  field,
  id,
}: FieldProps) => {
  const block = field.block;
  const schema = block.schema;
  const { options = EMPTY_ARRAY as Option[], multiple, noTitle } = schema;
  const { required, props, readonly } = state;
  const { direction = "column", ...rest } = props ?? EMPTY_OBJECT;
  const isSelected = useCallback(
    (value: string, _current: string[]) => _current.includes(value),
    [],
  );

  const handleSelect = useCallback(
    (value: string, _current: string[]) => {
      if (value?.length > 0) {
        const _value = value.replace("-", "");

        const _next = _current.includes(_value)
          ? _current.filter((_v: string) => _v !== _value)
          : [...(multiple ? _current : []), _value];

        field.set(_next.length > 0 ? _next.join(",") : undefined, true);
      }
    },
    [multiple],
  );

  const selectedItems = useMemo(
    () =>
      multiple
        ? getMultiValues(field.value)
        : field.value
          ? [field.value]
          : EMPTY_ARRAY,
    [multiple, field.value],
  ) as string[];

  return (
    <FieldControl
      field={field}
      state={state}
      {...rest}
      className={cn(
        "flex",
        direction === "row" ? "flex-row items-center gap-4" : "flex-col gape-2",
        rest?.className,
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={field.name}
          label={option.title}
          value={option.value}
          checked={isSelected(option.value!, selectedItems)}
          onChange={() => handleSelect(option.value!, selectedItems)}
          required={required}
          readOnly={readonly}
          disabled={readonly}
          id={`${id}-${option.value}`}
        />
      ))}
    </FieldControl>
  );
};

registerWidgets({
 radio: RadioField,
});