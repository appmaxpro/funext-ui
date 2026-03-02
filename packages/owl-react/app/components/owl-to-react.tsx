//import * as ng from "@angular/core";
import * as owl from "@odoo/owl";

import React, {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import ReactDOM from "react-dom";
//import { Subscribable, Unsubscribable } from "rxjs";
//import { InjectableReactContextToken } from "../injectable-react-context/react-context-token";
//import { useInjectableReactContext } from "../hooks/use-injectable-react-context";
import { useInTreeCreateRoot } from "../hooks/use-in-tree-create-root";
import { createOwlComponent } from "~/utils/owl-component-factory";
//import { InTreeCreateRootToken } from "../use-in-tree-create-root/in-tree-create-root-token";
//import { IsTopLevelReactToken } from "../templates/is-top-level-react-token";
import type { OwlRoot, OwlProps } from "./types";

function OwlToReact(
  {
    name: owlComponentName,
    component,
    app: owlApp,
    tmpl,
    tmplContext,
    events,
    outputs,
    children,
    serverFallback,
  }: {
    name: string;
    component: any;
    app: owl.App;
    tmpl?: string;
    tmplContext?: Record<string, any>;
    inputs?: Record<string, any>;
    events?: Record<string, (ev: Event) => any>;
    outputs?: Record<string, (value: any) => any>;
    children?: any;
    serverFallback?: string;
  },
  ref: ForwardedRef<OwlRoot<OwlProps, any> | null>,
) {
  if (!component)
    throw new Error("owl needs a component but none was provided");

  if (!owlApp) throw new Error("owl needs an app but none was provided");

  const [owlRoot, setOwlRoot] = useState<OwlRoot<OwlProps, any> | null>(null);

  const [owlElement, setOwlElement] = useState<HTMLDivElement | null>(null);
  const [owlRef, setOwlRef] = useState<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => owlRoot!, [owlRoot]);

  // TODO: for more compat see @angular/elements
  // https://github.com/angular/angular/blob/4332897baa2226ef246ee054fdd5254e3c129109/packages/elements/src/component-factory-strategy.ts#L200

  

  const inTreeCreateRoot = useInTreeCreateRoot();
  //const injectedReactContext = useInjectableReactContext();
  //ReactDOM.flushSync
  useEffect(() => {
    if (!tmpl && !component) return;
    console.log("Create OwlComponent ...");
    // extend the app with our passed react context
    // so the nested react-wrappers can access it
    const OwlComp =
      component ??
      createOwlComponent({
        app: owlApp,
        name: owlComponentName,
        template: tmpl as string,
      });

    const config = {
      props: {
        ...tmplContext,
        inTreeCreateRoot,
        isTopLevelReact: false,
        ref: (ref: HTMLDivElement) => {
          console.log("On OwlRef changed:", ref);
          setOwlRef(ref);
        },
      },
    };

    const root = owlApp.createRoot(OwlComp as any, config);
    setOwlRoot((old) => {
      if (old) {
        owlApp.subRoots.delete(old.node);
        old.destroy();
      }
      return root;
    });
    return () => {
      owlApp.subRoots.delete(root.node);
      root.destroy();
    };
  }, [component, owlApp, inTreeCreateRoot/*, injectedReactContext*/]);

  const owlCallbackRef = useCallback<(node: HTMLDivElement) => void>(
    (node) => {
      console.log(node);
      setOwlElement(node);
    },
    [owlRoot],
  );

  useEffect(() => {
    if (!owlRoot) return;
    if (!owlElement) return;

    async function mount() {
      if (!owlRoot) return;
      if (!owlElement) return;

      await owlRoot.mount(owlElement as HTMLElement);
    }
    mount();
  }, [owlRoot, owlElement]);

  //{React.createElement('div', { }, serverFallback)}
  return (
    <>
      {React.createElement(
        "owl",
        { ref: owlCallbackRef, className: "owl-app" },
        serverFallback,
      )}
      
      {inTreeCreateRoot.portals}
    </>
  );
}

const OwlToReactForwardRef = forwardRef(OwlToReact);

export { OwlToReactForwardRef as OwlToReact };
