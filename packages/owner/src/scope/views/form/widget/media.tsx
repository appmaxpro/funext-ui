
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
import { getMediaUrl, getWidgetStateForm } from "~/scope/utils";

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

  const form = getWidgetStateForm(field)!;

  const model = form.view.schema.model;
  if(model) {
     getMediaUrl(model, form.id);
  }

}