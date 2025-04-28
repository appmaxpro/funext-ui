import React, { useCallback, useMemo, useContext } from "react";
import { OwlWrapper } from "./owl-wrapper";
import { nestWrappers } from "./nest-wrappers";
import { TemplateOutletComponent } from "./template-outlet.component";
import { OwlAppContext } from "./owl-context";

type Props = {
  tmpl: string;
  tmplContext?: Record<string, any>;
};

export function OwlTemplateOutlet({ tmpl, tmplContext }: Props) {
  return (
    <OwlWrapper
      name="TemplateOutlet"
      tmpl={tmpl}
      tmplContext={tmplContext}
      component={TemplateOutletComponent}
    />
  );
}
/*
export const useFromAngularTemplateRefFnWithModule = (
  moduleRef: NgModuleRef<any>
) => {

  const angularReactService = useInjected(AngularReactService);
  if (!angularReactService)
    throw new Error(
      "AngularReactService is required when using useFromAngularTemplateRefWithModule"
    );

  return useCallback(
    function FromAngularTemplateRef(
      tmpl: TemplateRef<any>,
      tmplContext: Record<string, any> = {}
    ) {
      return nestWrappers(
        angularReactService.wrappers,
        <AngularTemplateOutlet tmpl={tmpl} tmplContext={tmplContext} />
      );
    },
    [moduleRef, angularReactService]
  );
};


export const useFromAngularTemplateRefFn = () => {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef) throw new Error("No AngularModuleContext");
  return useFromAngularTemplateRefFnWithModule(moduleRef);
};

export function useFromAngularTemplateRef<C extends Record<string, any>>(
  templateRef: TemplateRef<C>
) {
  const fn = useFromAngularTemplateRefFn();
  return useMemo(
    () => (tmplContext: C) => fn(templateRef, tmplContext),
    [templateRef, fn]
  );
}
  */