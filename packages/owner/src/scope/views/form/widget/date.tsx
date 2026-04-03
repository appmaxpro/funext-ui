import React from "react";
import type { FieldProps } from "./types";
import { getWidgetStateForm } from "~/scope/utils";
import format from "~/utils/format";
import type { Field } from "~/utils/data-types";
import { FieldControl } from "./root";
import { Input } from "@funext/ui";
import { registerWidgets } from "./hooks";

const DateField = ({ state, field, id, type }: FieldProps) => {
   const value= field.value;
   const schema = field.block.schema
   const text = React.useMemo(
    () =>
      value != null
        ? format(value, {
            props: { ...schema, pType: type, ...field.state.props } as Field,
            context: getWidgetStateForm(field)!.context,
          })
        : "",
    [value],
  );
  
  return (
    <FieldControl field={field} state={state}>
      <Input
        type="text"
        placeholder={schema.placeholder}
        {...state.props}
        name={schema.name}
        required={false}
        readOnly={true}
        value={text}
        disableBorder={getWidgetStateForm(field)?.readOnly}
        id={id}
      />
    </FieldControl>
  );
};


registerWidgets({
  date: DateField,
  datetime: DateField,
});