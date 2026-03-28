import type { IFieldState, IFState } from "~/scope/types";
import { FormControl, FormItem, FormMessage } from "./root";
import { Checkbox, Switch } from "@funext/ui";
import { getBoolean, i18n } from "~/utils";

export const BooleanField = ({
  state,
  field,
  id,
}: {
  state: IFState;
  field: IFieldState;
  id: string;
}) => {
  const block = field.block;
  const { required, props, readonly } = state;
  //const schema =
  const { noTitle } = field.block.schema;
  const Check = block.widget === 'switch' ? Switch : Checkbox;
  return (
    <FormItem className="min-w-[150px] flex-grow p-1">
      <FormControl>
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
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
