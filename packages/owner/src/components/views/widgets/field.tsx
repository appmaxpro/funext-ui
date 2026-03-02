import React, { useCallback, useMemo } from "react";

import { Checkbox, Input } from "@funext/ui";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldState,
  useFormField,
} from "./form";

import { SelectionPicker } from "./selection-picker";
import { i18n, type Block, type FieldBlock } from "~/utils";
import type { IFieldState, IWidgetState } from "../form";

export const FieldComponent = () => {
  const { state, field } = useFormField();
  const schema = field.widget.schema;

  const { readonly, hidden, required, props } = state;
  const Wrapper = useCallback(
    ({ children, className = "" }: { children: any; className?: string }) => {
      return (
        <FormItem className={`min-w-[150px] flex-grow p-1 ${className}`}>
          {children}
        </FormItem>
      );
    },
    [state],
  );

  const render = useCallback((): React.ReactElement => {
    /*
      if (item.type === 'custom') {
        return React.createElement(item.customComponent as any, {
          field: item,
          formKey: identifier,
          readonly: isReadonly,
          renderItem,
        });
      }*/

    if (schema.widget === "select" || schema.pType === 'select') {
      return (
        <Wrapper>
          <FormLabel className="text-base font-medium leading-6">
            {i18n.t(schema.title ?? "")}
            {required && <span className="text-destructive ms-1">*</span>}
          </FormLabel>
          <SelectionPicker
            field={field}
            readonly={readonly}
            itemSet={schema.options}
          />
          <FormMessage />
        </Wrapper>
      );
    }

    if (schema.pType === "boolean") {
      return (
        <Wrapper className="my-2 flex items-center gap-3">
          <FormControl>
            <Checkbox
              {...props}
              label={`${i18n.t(schema.title ?? "")} ${required && <span className="text-destructive ms-1">*</span>}`}
              required={required}
              disabled={readonly}
            />
          </FormControl>
        </Wrapper>
      );
    }

    if (
      schema.pType === "string" ||
      schema.pType === "int" ||
      schema.pType === "float" ||
      schema.pType === "decimal"
    ) {
      return (
        <Wrapper>
          <FormLabel className="text-base font-medium leading-6">
            {i18n.t(schema.title ?? "")}
            {required && <span className="text-destructive ms-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              className="py-3 px-4 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-0 text-main-black dark:text-white placeholder:text-sm placeholder:font-normal h-[2.875rem] border text-sm font-normal"
              type={schema.pType === "string" ? "text" : "number"}
              placeholder={schema.placeholder}
              {...field}
              required={required}
              disabled={readonly}
            />
          </FormControl>
          <FormMessage />
        </Wrapper>
      );
    }

    return null as any;
  }, [Wrapper, readonly, required, field]);

  if (hidden) {
    return null;
  }

  return render();
};

export const Field = ({ field }: { field: FieldBlock }) => {
  return (
    <FormField field={field}>
      <FieldComponent />
    </FormField>
  );
};
