"use client";

import React, { useCallback, useMemo } from "react";

import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  getMultiValues,
  i18n,
  type Option,
} from "~/utils";

import { Button, cn, Menu, Radio } from "@funext/ui";
import { Icons } from "~/components/shared/icons";
import type { IFieldState, IFState } from "../../../types";
import { Select } from "~/components/shared";
import { FormControl, FormItem, FormLabel, FormMessage } from "./root";

export const RadioField = ({
  state,
  field,
  id,
}: {
  state: IFState;
  field: IFieldState;
  id: string;
}) => {
  const block = field.block;
  const schema = block.schema;
  const { options = EMPTY_ARRAY as Option[], multiple, noTitle } = schema;
  const { required, props, readonly } = state;
  const { direction = "column", controlProps, ...rest } = props ?? EMPTY_OBJECT;
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
    <FormItem className="min-w-[150px] flex-grow p-1">
      {!noTitle && (
        <FormLabel className="text-base font-normal leading-6">
          {i18n.t(schema.title ?? field.name)}
          {required && <span className="text-destructive ms-1">*</span>}
        </FormLabel>
      )}
      <FormControl
        className={cn(
          "flex",
          direction === "row"
            ? "flex-row items-center gap-4"
            : "flex-col gape-2",
          controlProps?.className,
        )}
        {...controlProps}
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
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
