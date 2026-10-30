"use client";

import { EMPTY_ARRAY, getMultiValues, i18n, type Option } from "~/utils";

import { Button, Menu } from "~/ui";
import { Select } from "~/components/shared";
import { Icons } from "~/components/shared/icons";
import { registerWidgets } from "./hooks";
import { FieldControl } from "./root";
import type { FieldProps } from "./types";
import { noop } from "lodash";

export const SelectField = ({ state, field, id, type }: FieldProps) => {
  const block = field.block;
  const schema = block.schema;
  const { options = EMPTY_ARRAY as Option[], multiple, noTitle } = schema;
  const { required, props, readonly } = state;

  return (
    <FieldControl field={field} state={state}>
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
    </FieldControl>
  );
};

const ReadonlyField = ({ state, field, id, type }: FieldProps) => {
  const block = field.block;
  const schema = block.schema;
  const { options = EMPTY_ARRAY as Option[], multiple, noTitle } = schema;
  const { props } = state;

  return (
    <FieldControl field={field} state={state}>
      <Select
        {...props}
        options={options}
        value={field.value}
        multiple={multiple}
        readOnly={true}
        onChange={noop as any}
        id={id}
      />
    </FieldControl>
  );
};

registerWidgets({
  menu: SelectField,
  select: SelectField,
  readonly: ReadonlyField,
});
