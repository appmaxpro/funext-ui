import type { IFieldState, IFState } from "~/scope/types";
import { FieldControl, FormControl, FormItem, FormMessage } from "./root";
import { Checkbox, Switch } from "@funext/ui";
import { getBoolean, i18n } from "~/utils";
import { RadioField } from "./radio";
import { registerWidgets } from "./hooks";
import { check } from "prettier";
import type { FieldProps } from "./types";

const BooleanField = ({ state, field, id, type }: FieldProps) => {
  const block = field.block;
  const { required, props, readonly } = state;
  //const schema =
  const { noTitle } = field.block.schema;
  const Check = type === "switch" ? Switch : Checkbox;
  //const {}
  return (
    <FieldControl showLabel={false}>
      <Check
        {...props}
        name={field.name}
        label={
          !noTitle &&
          `${i18n.t(block.title ?? field.name)} ${required && <span className="text-destructive ms-1">*</span>}`
        }
        required={required}
        readOnly={readonly}
        disabled={readonly}
        checked={getBoolean(field.value)}
        onChange={(event: any) => field.set(event.target.checked, true, true)}
        id={id}
      />
    </FieldControl>
  );
};

registerWidgets({
  switch: BooleanField,
  boolean: BooleanField,
  checkbox: BooleanField,
});
