import React from "react";

import { useFormField, WidgetStateProvider } from "./root";

import { getWidgetStateForm } from "~/scope/utils";
import { type FieldBlock } from "~/utils";
import { meta } from "../../../block";
import type { IFieldState, IFState } from "../../../types";
import { useInput, useWidget } from "./hooks";
import { Spinner } from "~/ui";

export const FieldComponent = React.memo(() => {
  const { state, field, id } = useFormField();
  const { hidden } = state;
  if (hidden) {
    return null;
  }
  return <RenderField state={state} field={field} id={id} />;
});

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

  const [type, FC] = useWidget(
    pType,
    widget,
    getWidgetStateForm(field)?.readOnly,
  );

  return FC ? (
    <FC state={state} field={field} id={id} type={type} />
  ) : (
    <div>
      Unsupported widget: {field.name} with type ({pType})
    </div>
  );
};

const RenderFieldBlock = React.memo(()=> {
  const { state, field, id } = useFormField();
  const inputs = useInput(field);
  const { hidden } = state;
  if (hidden) {
    return null;
  }

  return <DoRenderFieldBlock state={state} field={field} id={id} />;
})

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


let initd = false;

async function init() {
  await import('./inputs');
  await import('./media');
  await import('./select');
  await import('./relation');
  await import('./boolean');
  await import('./date');
  await import('./radio');
  initd = true;
  return true;
}

const initPromo = init();

export const Field = meta<{ block: FieldBlock }>(
  ({ block }) => {

    if (!initd) {
        const hasInitd = React.use(initPromo);
        if(hasInitd !== true)
          return <Spinner/>
    }
    return !!block.schema.name ? (
      <WidgetStateProvider widget={block}>
        {React.createElement(block?.render ? RenderFieldBlock : FieldComponent)}
      </WidgetStateProvider>
    ) : null
  },
  { wrap: "prop", noProps: true },
);






