"use client";

import React, { useCallback, useMemo } from "react";

import { i18n, type FieldBlock} from "~/utils";

import { Button, Menu } from "@funext/ui";
import type { IFieldState } from "../form";
import { Icons } from "~/components/other/icons";

export const SelectionPicker = ({
  field,
  itemSet,
  isMulti = false,
  isInteger = false,

}: {
  field: IFieldState;
  readonly?: boolean;
  itemSet?: any[];
  isMulti?: boolean;
  isInteger?: boolean;
}) => {
  const options = useMemo(
    () => itemSet?.map((_o) => ({ ..._o, label: _o.title })) ?? [],
    [itemSet],
  );

  const isSelected = useCallback(
    (value: string, _current: string[]) => _current.includes(value),
    [],
  );

  const handleSelect = useCallback(
    (value: string, _current: string[]) => {
      if (value?.length > 0) {
        const _value = value.replace("-", "");

        if (isInteger) {
          field.set(parseInt(_value), true);
          return;
        }

        const _next = _current.includes(_value)
          ? _current.filter((_v: string) => _v !== _value)
          : [...(isMulti ? _current : []), _value];

        field.set(_next.length > 0 ? _next.join(",") : undefined, true);
      }
    },
    [isInteger, isMulti],
  );

  const formValue = "" + field.get;
  const selectedItems = formValue?.split(",") ?? [];

  return (
    <Menu>
      <Button variant="ghost" color="inherit">
        <div className="truncate">
          {selectedItems?.length > 0
            ? selectedItems
                .map((v: string) => options.find((_i) => _i.value === v)?.label)
                .join(", ")
            : i18n.t("Select an option...")}
        </div>
      </Button>
      {options.map((item) => {
        const _value = item.value;
        const isItemSelected = isSelected(_value, selectedItems);

        return (
          <Menu.Item
            key={_value}
            value={`-${_value}`}
            onClick={() => handleSelect(_value, selectedItems)}
          >
            {isItemSelected && (
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Icons.Check className="h-4 w-4" />
              </span>
            )}
            {item.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
};
