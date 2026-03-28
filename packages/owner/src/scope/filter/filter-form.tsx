import * as React from "react";
import { useCreateFilterForm, type FilterFormProps } from "../views/form";
import { Root } from "../views/form/widget";

import { IFormContext, useFormContext } from "~/context";
import { Button, Dialog } from "@funext/ui";
import { EMPTY_OBJECT, i18n, type FormViewBlock } from "~/utils";
import type { EditableFormState } from "../types";
import { meta, renderBlockItems } from "../block";

const nullProps = {
  search() {
    return Promise.resolve(EMPTY_OBJECT)
  },
  filter: EMPTY_OBJECT,
  updateFilters(filter: any){

  }
}

function Form(props:FilterFormProps) {
  const form = useCreateFilterForm(props);
  console.log("FormRender::", form.view)
  //const children = React.useMemo(() => renderBlockItems(form.view, form.context), [form]);
  return (
    <IFormContext.Provider value={form}>
      <Dialog.Body className="p-2">
        <FormRender form={form}/>
      </Dialog.Body>
      <Actions/>
    </IFormContext.Provider>
  );
}
Form.defaultProps = {
  search() {
    return Promise.resolve(EMPTY_OBJECT)
  },
  filter: EMPTY_OBJECT,
  updateFilters(filter: any){

  }
}

Form.displayName = "FilterForm";

const FormRender = React.memo(({ form }: { form: EditableFormState }) => {
  const [com, setCom] = React.useState<React.ReactNode>();
  
  React.useEffect(() => {
    setCom(
      <Root form={form}>{renderBlockItems(form.view, form.context)}</Root>,
    );
  }, [form]);
  return com;
});

function Actions() {
  const form = useFormContext();
  //const record = React.useSyncExternalStore(form.store.subscribe, form.store.snapshot)
  const state = React.useSyncExternalStore(form.subscribe, form.snapshot );
  const rec = React.useSyncExternalStore(form.store.subscribe, form.store.snapshot );

  return (
    <Dialog.Footer>
      <Button type="reset" onClick={form.refresh} disabled={!Object.keys(rec).length}>
        {i18n.get("Reset")}
      </Button>
      <Button type="submit" onClick={form.submit} disabled={!state.dirty}>
        {i18n.get("Submit")}
      </Button>
    </Dialog.Footer>
  );
}

const MForm = React.memo(Form);

//Object.assign
export const FilterForm = {
  Form: MForm,
  Actions
};
