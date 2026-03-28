
import { Input } from "@funext/ui";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from "./root";

import {
  i18n
} from "~/utils";
import format from "~/utils/format";
import type { IFieldState, IFState } from "../../../types";
import { useInput } from "./hooks";

export const InputField = ({
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

  const { required, props, readonly } = state;

  const { value, text, onChange, onFocus, onBlur, onKeyDown } =
    useInput(field);
  const { noTitle } = schema;
  //const value = field.value;
  console.log("InputField:: ", {
    field: field,
    value,
    fmt: format(value, { props: schema, context: field.context }),
    required,
    props,
    readonly,
  });

  return (
    <FormItem className="min-w-[150px] flex-grow p-1">
      {!noTitle && (
        <FormLabel className="text-base font-normal leading-6">
          {i18n.t(schema.title ?? field.name)}
          {required && <span className="text-destructive ms-1">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <Input
          type={schema.pType === "string" ? "text" : "number"}
          placeholder={schema.placeholder}
          name={schema.name}
          required={required}
          readOnly={readonly}
          as={schema.pType === "text" ? "textarea" : undefined}
          //value={format(field.value, { props: schema, context: field.context })}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          id={id}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
