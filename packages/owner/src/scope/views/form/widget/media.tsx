
import { FieldControl } from "./root";

import { getWidgetStateForm } from "~/scope/utils";
import { EMPTY_OBJECT } from "~/utils";
import type { IFieldState, IFState } from "../../../types";
import { registerWidgets } from "./hooks";

export const MediaField = ({
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
  const { noTitle = true } = schema;
  const form = getWidgetStateForm(field)!;
  
  const model = schema.target ?? form.view.schema.model;
  if (model) {
    //getMediaUrl(model, form.id);
  }
  const { params, mediType, ...rest } = props || EMPTY_OBJECT;

  const src = form.context._media(field.name, params);

  return (
    <FieldControl field={field} state={state} showLabel={false}>
      <img src={src} {...rest} />
    </FieldControl>
  );
};


registerWidgets({
  binary: MediaField,
  file: MediaField,
  image: MediaField,  
  video: MediaField,
  audio: MediaField,
});