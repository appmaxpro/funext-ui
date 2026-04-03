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
import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  getBoolean,
  i18n,
  type FieldBlock,
} from "~/utils";
import type { IFieldState, IFState } from "../../../types";
import { meta } from "../../../block";
import format from "~/utils/format";
import { useFormContext } from "~/context";
import { useInput, useSimpleInput, useWidget } from "./hooks";
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
  const { widget, pType } = schema;

  const [type, FC] = useWidget(pType, widget, getWidgetStateForm(field)?.readOnly);

  return FC ? (
    <FC state={state} field={field} id={id} type={type} />
  ) : (
    <div>
      Unsupported widget: {field.name} with type ({pType})
    </div>
  );
};

function RenderFieldBlock(): React.ReactNode {
  const { state, field, id } = useFormField();
  const inputs = useInput(field);
  const { hidden } = state;
  if (hidden) {
    return null;
  }

  return <DoRenderFieldBlock state={state} field={field} id={id} />;
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
  const form = getWidgetStateForm(field)!;
  const render = block.render;
  if (typeof render === "function") {
    return render({
      useInput,
      form,
      field,
    } as any);
  }
}

export const Field = meta<{ block: FieldBlock }>(
  ({ block }) =>
    !!block.schema.name ? (
      <WidgetStateProvider widget={block}>
        {React.createElement(
          block?.render ? RenderFieldBlock : FieldComponent,
        )}
      </WidgetStateProvider>
    ) : null,
  { wrap: "prop", noProps: true },
);
