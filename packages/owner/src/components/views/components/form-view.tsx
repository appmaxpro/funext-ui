import * as React from "react";
import { IFormContext, useCreateFormContext } from "../form";
import { Form as CForm, Field, Panel} from "../widgets";

export function FormView(props: React.ComponentPropsWithRef<'form'>) {
  const formContext = useCreateFormContext()
  return (
    <IFormContext.Provider value={formContext}>
      <CForm {...props}/>
    </IFormContext.Provider>
  );
}

export declare namespace Form {
  export {FormView as Form}
  export {Field}
  export {Panel}
}
