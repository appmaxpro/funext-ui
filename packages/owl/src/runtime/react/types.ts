interface Element {}
type ReactInstance = Component<any> | Element;

interface NewLifecycle<P, S, SS> {
  /**
   * Runs before React applies the result of {@link Component.render render} to the document, and
   * returns an object to be given to {@link componentDidUpdate}. Useful for saving
   * things such as scroll position before {@link Component.render render} causes changes to it.
   *
   * Note: the presence of this method prevents any of the deprecated
   * lifecycle events from running.
   */
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  /**
   * Called immediately after updating occurs. Not called for the initial render.
   *
   * The snapshot is only present if {@link getSnapshotBeforeUpdate} is present and returns non-null.
   */
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
}


interface ComponentLifecycle<P, S, SS = any>
  extends NewLifecycle<P, S, SS> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void;
  /**
   * Called to determine whether the change in props and state should trigger a re-render.
   *
   * `Component` always returns true.
   * `PureComponent` implements a shallow comparison on props and state and returns true if any
   * props or states have changed.
   *
   * If false is returned, {@link Component.render}, `componentWillUpdate`
   * and `componentDidUpdate` will not be called.
   */
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount?(): void;
  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: any): void;

  
}

type GetDerivedStateFromProps<P, S> = (nextProps: Readonly<P>, prevState: S) => Partial<S> | null;
type GetDerivedStateFromError<P, S> = (error: any) => Partial<S> | null;

interface StaticLifecycle<P, S> {
  getDerivedStateFromProps?: GetDerivedStateFromProps<P, S> | undefined;
  getDerivedStateFromError?: GetDerivedStateFromError<P, S> | undefined;
}

// Base component for plain JS classes
interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {
  render(): ReactNode;
  setState<K extends keyof S>(
    state:
      | ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null)
      | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;
  state: Readonly<S>;

  readonly props: Readonly<P>;

  context: unknown;
  
}

/*
class Component<P, S> {
  context: unknown;

  constructor(props: P);

  // We MUST keep setState() as a unified signature because it allows proper checking of the method return type.
  // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365#issuecomment-351013257
  // Also, the ` | S` allows intellisense to not be dumbisense
  setState<K extends keyof S>(
    state:
      | ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null)
      | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;

  forceUpdate(callback?: () => void): void;
  render(): ReactNode;

  readonly props: Readonly<P>;
  state: Readonly<S>;
}
  */

interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
  new (props: P, context?: any): Component<P, S>;
}

interface FunctionComponent<P = {}> {
  (props: P): ReactNode;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

type JSXElementConstructor<P> = new (props: P) => Component<any, any>;

//class PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {}

interface ReactElement<
  P = any,
  T extends string | FunctionComponent<P> | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>
> {
  type: T;
  props: P;
  key: string | null;
}

type ComponentState = any;



interface FunctionComponentElement<P extends {}> extends ReactElement<P, FunctionComponent<P>> {
  ref?:
    | ("ref" extends keyof P ? (P extends { ref?: infer R | undefined } ? R : never) : never)
    | undefined;
}

type CElement<P, T extends Component<P, ComponentState>> = ComponentElement<P, T>;

interface ComponentElement<P, T extends Component<P, ComponentState>>
  extends ReactElement<P, ComponentClass<P>> {}

interface ReactPortal extends ReactElement {
  children: ReactNode;
}

type ReactNode =
  | ReactElement
  | string
  | number
  | Iterable<ReactNode>
  | ReactPortal
  | boolean
  | null
  | undefined;

interface INode<T extends INode<any> = any> {
  set parent(el: IElement<T>|null|undefined);
  get parent(): IElement<T>|null|undefined;
}

interface IElement<T extends INode<any> = any> extends INode<T>{
  insertBefore (node: T, beforeNode?: T| null): void;
  appendChild (node: T): void;
  removeChild(node: T): void;
}
interface IText {

}


export {
  ReactNode,
  ReactPortal,
  FunctionComponentElement,
  ReactElement,
  Component,
  ComponentType,
  ComponentState,
  ComponentClass,
  INode,
  IElement,
  IText
}
