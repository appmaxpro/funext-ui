import React, { useCallback, useMemo, useContext } from "react";
import { OwlWrapper } from "./owl-wrapper";
import { nestWrappers } from "./nest-wrappers";
import { TemplateOutletComponent } from "./template-outlet.component";
import { OwlAppContext } from "./owl-context";

type Props = {
  tmpl: string;
  tmplContext?: Record<string, any>;
};

export function ReactOutlet({ tmpl, tmplContext }: Props) {
  return (
    <OwlWrapper
      name="TemplateOutlet"
      tmpl={tmpl}
      tmplContext={tmplContext}
      component={TemplateOutletComponent}
    />
  );
}