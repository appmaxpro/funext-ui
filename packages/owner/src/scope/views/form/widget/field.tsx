import React, { useCallback } from "react";

import { Checkbox, Input } from "@funext/ui";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
  WidgetStateProvider,
} from "./root";

import { SelectField } from "./select";
import { EMPTY_ARRAY, EMPTY_OBJECT, getBoolean, i18n, type FieldBlock } from "~/utils";
import type { IFieldState, IFState } from "../../../types";
import { meta } from "../../../block";
import format from "~/utils/format";
import { useFormContext } from "~/context";
import { useInput, useSimpleInput } from "./hooks";
import { getWidgetStateForm } from "~/scope/utils";

export const FieldComponent = () => {
  const { state, field, id } = useFormField();
  const { hidden } = state;
  if (hidden) {
    return null;
  }
  return <RenderField state={state} field={field} id={id} />;
};

const RenderField = ({
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

  const { value, text, setValue, onChange, onFocus, onBlur, onKeyDown } =
    useInput(field);
  const { noTitle } = schema;
  //const value = field.value;
  console.log("RenderField:: ", {
    field: field,
    value,
    fmt: format(value, { props: schema, context: field.context }),
    required,
    props,
    readonly,
  });

  const Wrapper = useCallback(
    ({ children, className = "" }: { children: any; className?: string }) => {
      return (
        <FormItem className={`min-w-[150px] flex-grow p-1 ${className}`}>
          {children}
        </FormItem>
      );
    },
    [],
  );

  const render = (): React.ReactElement => {
    

    if (schema.pType === "boolean") {
      return (
        <Wrapper className="my-2 flex items-center gap-3">
          <FormControl>
            <Checkbox
              {...props}
              name={schema.name}
              label={
                !noTitle &&
                `${i18n.t(schema.title ?? field.name)} ${required && <span className="text-destructive ms-1">*</span>}`
              }
              required={required}
              readOnly={readonly}
              disabled={readonly}
              checked={getBoolean(value)}
              onChange={(event: any) =>
                field.set(event.target.checked, true, true)
              }
              id={id}
            />
          </FormControl>
        </Wrapper>
      );
    }

    if (
      schema.pType === "string" ||
      schema.pType === "text" ||
      schema.pType === "int" ||
      schema.pType === "float" ||
      schema.pType === "decimal"
    ) {
      return (
        <Wrapper>
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
              //as={schema.pType === "text" ? "textarea" : undefined}
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
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        {!noTitle && (
          <FormLabel className="text-base font-normal leading-6">
            {i18n.t(schema.title ?? field.name)}
            {required && <span className="text-destructive ms-1">*</span>}
          </FormLabel>
        )}
        <Input
          type="text"
          name={schema.name}
          placeholder={schema.placeholder}
          required={required}
          readOnly={readonly}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          id={id}
        />
        <FormMessage />
      </Wrapper>
    );
  };

  return render();
};

function RenderFieldBlock(): React.ReactNode {
  const { state, field, id } = useFormField();
  const inputs = useInput(field);
  const { hidden } = state;
  if (hidden) {
    return null;
  }

  return null;
}

function DoRenderFieldBlock({
  state,
  field,
  id,
}: {
  state: IFState;
  field: IFieldState;
  id: string;
}) {
  const block = field.block;
  const schema = block.schema;
  const form = getWidgetStateForm(field)!;
  const {props} = state;
  const fieldRender = props ?? EMPTY_OBJECT;
  if(typeof fieldRender === 'function') {
    return fieldRender({
      useInput,
      form,
      field,
    })
  }
}

export const Field = meta<{ block: FieldBlock }>(
  ({ block }) =>
    !!block.schema.name ? (
      <WidgetStateProvider widget={block}>
        {React.createElement(block?.props?.fieldRender ? RenderFieldBlock : FieldComponent)}
      </WidgetStateProvider>
    ) : null,
  { wrap: "prop", noProps: true },
);
