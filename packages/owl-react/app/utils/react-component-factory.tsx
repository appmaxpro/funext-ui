import {
  type Component as OwlComponent,
  type ComponentConstructor,
  Component,
  App,
  xml,
  OwlError,
} from "@odoo/owl";
import * as React from "react";

import type { OwlRoot, OwlProps } from "../components/types";
import { useInTreeCreateRoot } from "~/hooks/use-in-tree-create-root";

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;
type OwlComProps = OwlProps & {
  app: App
} 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributiveOmit<T, K extends string | number | symbol> = T extends any
  ? K extends keyof T
    ? Omit<T, K>
    : T
  : T;
type PropsWithoutRef<T> = DistributiveOmit<T, 'ref'>;

// Acceptable props to the React component.
type OwlComponentProps<I, E extends OwlComProps> = Omit<
  React.HTMLAttributes<I>,
  // Prefer type of provided event handler props or those on element over
  // built-in HTMLAttributes
  keyof E | keyof ElementProps<I>
> &
  ElementProps<I> & E;

export type ReactOwlComponent<
  I extends HTMLElement,
  E extends OwlComProps,
> = React.ForwardRefExoticComponent<
  // TODO(augustjk): Remove and use `React.PropsWithoutRef` when
  // https://github.com/preactjs/preact/issues/4124 is fixed.
  PropsWithoutRef<OwlComponentProps<I, E>> & React.RefAttributes<I>
>;

export interface OwlOptions<I extends HTMLElement, E extends OwlComProps> {
  tagName: string;
  owl: ComponentConstructor<Omit<E, 'app'>, any>;
  displayName?: string;
}

const owlCache = new WeakMap<ComponentConstructor, ReactOwlComponent<HTMLElement, any>>();

export const createOwlWrapper = <I extends HTMLElement, E extends OwlComProps>({
  tagName,
  owl,
  displayName,
}: OwlOptions<I, E>): ReactOwlComponent<I, E> => {

  
  let result = owlCache.get(owl)

  if (result) {
    return (result as ReactOwlComponent<I, E>);
  }

  type Props = OwlComponentProps<I, E>;

  const ReactComponent = React.forwardRef<I, Props>((props, ref) => {
      
      const {app, ...owlProps} = props
      const [owlRoot, setOwlRoot] = React.useState<OwlRoot<OwlProps, any> | null>(null);

      const [owlElement, setOwlElement] = React.useState<I | null>(null);
      const [owlRef, setOwlRef] = React.useState<I | null>(null);

      const inTreeCreateRoot = useInTreeCreateRoot();
      //const injectedReactContext = useInjectableReactContext();
      //ReactDOM.flushSync
      React.useEffect(() => {
        if (!owl) return;
        console.log("Create OwlComponent ...");
       
        const treeCreateRoot = (container: any) => inTreeCreateRoot.createRoot(container)

        const config = {
          inTreeCreateRoot: treeCreateRoot,
          props: {
            ...owlProps,
            inTreeCreateRoot: treeCreateRoot,
            isTopLevelReact: false,
            ref: (ref: I) => {
              console.log("On OwlRef changed:", ref);
              setOwlRef(ref);
            },
          },
        };

        const root = app.createRoot(owl as any, config);
        setOwlRoot((old) => {
          if (old) {
            app.subRoots.delete(old.node);
            old.destroy();
          }
          return root;
        });
        return () => {
          app.subRoots.delete(root.node);
          root.destroy();
        };
      }, [inTreeCreateRoot]);

      const elRef = React.useCallback<(node: I) => void>(
        (node) => {
          console.log(node);
          setOwlElement(node);
        },
        [owlRoot],
      );

      React.useEffect(() => {
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
            tagName,
            { ref: elRef, className: "owl-app" },
          )}
          
          {inTreeCreateRoot.portals}
        </>
      );

    
  });

  if (displayName)
    ReactComponent.displayName = displayName;

  owlCache.set(owl, ReactComponent as any)

  return ReactComponent;
};
