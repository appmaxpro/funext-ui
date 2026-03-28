import {
  deepEqual,
  EMPTY_ARRAY,
  EMPTY_RECORD,
  getMultiValues,
  toKebabCase,
  type DataRecord,
  type PropertyType,
  type SearchFilterField,
  type Widget,
} from "~/utils";
import type { OnFilterChange } from "../types";
import React from "react";
import type { TestFilter } from "~/utils/filter";

export type SelectType = {
  title: string;
  name: string;
  value?: any;
};

export function getFilterValue(value: any, multiple?: boolean) {
  if (multiple) {
    return Array.isArray(value) ? value : value ? [value] : EMPTY_RECORD;
  }
  return value ? [value] : EMPTY_RECORD;
}

export function toggleFilterValue(
  value: any,
  values: any,
  multiple?: boolean,
) {
  if (multiple && !values)
      values = EMPTY_ARRAY;

  if (multiple && !Array.isArray(values)) !!values ? [values] : EMPTY_ARRAY;

  const selected = multiple ? values.includes(value) : value === values;
  let newValues;
  if (multiple) {
    newValues = selected
      ? values.filter((val:any) => val !== value)
      : [...values, value];
    if (!newValues.length) {
      newValues = null;
    }
  } else {
    newValues = selected ? null : value;
  }

  return newValues;
}

export function getItemFieldType(field?: SearchFilterField) {
  let type = toKebabCase(field?.pType || field?.widget || "");

  return type;
}

export function convertValues(
  values: any,
  type?: PropertyType,
  multiple?: boolean,
) {
  if (values == null) return null;

  if (type === "select") {
    if (Array.isArray(values) && multiple) return values;
    if (multiple) return getMultiValues(values);
    return Array.isArray(values) ? values[0] : values;
  }

  if (multiple && !Array.isArray(values)) values = [values];

  if (!type || ["string", "text"].includes(type)) return values;

  const array = Array.isArray(values) ? values : [values];

  switch (type) {
    case "int": {
      array.forEach((value, index) => (array[index] = parseInt(value + "")));
      break;
    }

    case "boolean": {
      array.forEach((value, index) => (array[index] = !!value));
      break;
    }
    case "float":
    case "decimal": {
      array.forEach((value, index) => (array[index] = parseFloat(value + "")));
      break;
    }

    case "date":
    case "datetime":
      array.forEach((value, index) => {
        if (value instanceof Date) return;
        if (value === "now") {
          array[index] = Date.now();
          return;
        }
        if (typeof value === "number") {
          array[index] = new Date(value);
          return;
        }
      });
  }

  if (multiple) return array;

  return array[0];
}

export function isChecked(
  value: any,
  values: any,
  type?: PropertyType,
  multiple?: boolean,
) {
  if (!values || value == null) return false;
  if (multiple && !Array.isArray(values)) values = [values];
}

export const getFilterForEvent = (
  event: Event,
  values: DataRecord,
  items: TestFilter[],
) => {

  console.log("getFilterForEvent:: values:",  values)

  const target = event.target as HTMLElement;
  const currentTarget = event.currentTarget as HTMLElement ?? target;
  const value = currentTarget.dataset["value"] ?? target.dataset["value"];
  const newChangeValue = currentTarget.dataset["new_value"];

  const list = currentTarget.closest('[data-list=""]') as HTMLElement;

  if (list) {
    const filterKey = list.dataset["filter_key"];
    if (filterKey) {
      const filter = items.find((item) => (item as any).name === filterKey);
      if (filter) {
        const canMulti = ["select", "mto", "mtm", "group"];
        const multiple =
          "multiple" in filter && canMulti.includes(filter.widget!)
            ? !!filter.multiple
            : false;
        let newValue = newChangeValue
          ? newChangeValue
          : toggleFilterValue(value, values[filterKey], multiple);

        const newValues = { ...values, [filterKey]: newValue };

        return deepEqual(newValues, values) ? values : newValues;
      }
    }
  }
  return values
};
