"use client";

import React, { useCallback, useMemo } from "react";

import { EMPTY_ARRAY, getMultiValues, i18n, type Option } from "~/utils";

import { Button, Menu, Radio } from "@funext/ui";
import { Icons } from "~/components/shared/icons";
import type { IFieldState, IFState } from "../../../types";
import { Select } from "~/components/shared";
import { FormControl, FormItem, FormLabel, FormMessage } from "./root";

export const SelectField = ({
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

  const menu = field.block.schema.widget === "menu";

  return (
    <FormItem className="min-w-[150px] flex-grow p-1">
      {!noTitle && (
        <FormLabel className="text-base font-normal leading-6">
          {i18n.t(schema.title ?? field.name)}
          {required && <span className="text-destructive ms-1">*</span>}
        </FormLabel>
      )}
      <FormControl>
        {menu ? (
          <Menu>
            <Button variant="ghost" color="inherit" id={id}>
              <div className="truncate">
                {selectedItems?.length > 0
                  ? selectedItems
                      .map(
                        (v: string) =>
                          options.find((_i) => _i.value === v)?.title,
                      )
                      .join(", ")
                  : i18n.t("Select an option...")}
              </div>
            </Button>
            {options.map((item) => {
              const _value = item.value!;
              const isItemSelected = isSelected(_value, selectedItems);

              return (
                <Menu.Item
                  key={_value}
                  data-value={`-${_value}`}
                  onClick={() => handleSelect(_value, selectedItems)}
                  disabled={readonly}
                >
                  <Menu.Prefix>
                    {isItemSelected ? (
                      <Icons.Check className="h-4 w-4" />
                    ) : (
                      <Icons.Blank className="h-4 w-4" />
                    )}
                  </Menu.Prefix>

                  {item.title}
                </Menu.Item>
              );
            })}
          </Menu>
        ) : (
          <Select
            {...props}
            options={options}
            value={field.value}
            multiple={multiple}
            onChange={(value) => field.set(value, true, true)}
            required={required}
            readOnly={readonly}
            id={id}
          />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
