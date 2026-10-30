import { Checkbox, Switch } from "~/ui";
import { getBoolean, i18n } from "~/utils";
import { registerWidgets } from "./hooks";
import { FieldControl } from "./root";
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
