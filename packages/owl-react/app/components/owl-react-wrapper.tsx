import {
  Component as OwlComponent,
  App,
  useRef,
  onMounted,
  onWillUnmount,
  onWillUpdateProps,
  onPatched,
  onWillRender,
  onRendered,
  ComponentNode,
  helpers,
  blockDom,
  type VNode,
  type BDom,
} from "@odoo/owl";

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RootOwlAppContextProvider } from "./owl-context";
import { nestWrappers } from "./nest-wrappers";
import { OwlTemplateOutlet } from "./owl-template-outlet";
import Child from "./owl-react-child";

export interface OwlReactProps {
  component: React.ElementType;
  isTopLevelReact?: boolean;
  inTreeCreateRoot?: typeof ReactDOM.createRoot;
  childrenTmpl?: any;
  owlApp?: any;
  [key: string]: any;
}

export class OwlReactWrapper<
  Props extends OwlReactProps,
  Env = any,
> extends OwlComponent<Partial<Props>, Env> {
  static template = "__wrapper__";
  //static components = [OwlPortal]

  reactDomRoot: ReactDOM.Root | null = null;
  private inTreeCreateRoot?: typeof ReactDOM.createRoot;
  private appInTreeCreateRoot?: typeof ReactDOM.createRoot;
  private component?: React.ElementType;
  private childrenTmpl?: any;
  private node: ComponentNode;

  rootEl?: HTMLElement;

  private isTopLevelReact?: boolean;
  private mountedEl?: Element;
  private name?: String;

  slots?: any;
  constructor(props: Props, env: Env, node: ComponentNode) {
    const {
      component,
      isTopLevelReact,
      inTreeCreateRoot,
      childrenTmpl,
      __reactName,
      ...rest
    } = props;

    super(rest as Partial<Props>, env, node);
    this.inTreeCreateRoot = inTreeCreateRoot;
    this.component = component;
    this.childrenTmpl = childrenTmpl;
    this.node = node;
    this.isTopLevelReact = isTopLevelReact;
    this.name = __reactName;
  }

  setup() {
    console.log("OwlReactWrapper:::", this);
    if (!this.isTopLevelReact && !this.inTreeCreateRoot) {
      console.error(
        "Rendering a react-wrapper without an inTreeCreateRoot function.\n" +
          'This is likely caused by <ng-container [ngTemplateOutlet]="..." /> without having a [ngTemplateOutletInjector].\n' +
          'Please add [ngTemplateOutletInjector]="injector" to any [ngTemplateOutlet] that takes a template from `useToAngularTemplateRef` ' +
          "(alongside `public injector: Injector` in your constructor).\n" +
          "If that is not possible, use `useToAngularTemplateRefBoundToContextAndPortals` instead of `useToAngularTemplateRef`. ",
      );
    }

    onMounted(() => {
      console.log("OwlReactWrapper onMounted:", this.name);
    });

    onPatched(() => {
      console.log("OwlReactWrapper onPatched:", this.name);
      //this.renderReact();
    });

    onWillUnmount(() => {
      // wait one microtask to make sure that the react component is done rendering (logs errors otherwise)
      this.unmount();
    });
    onWillUpdateProps((nextProps) => {
      console.log(
        "OwlReactWrapper onWillUpdateProps:",
        this.name,
        ", nextProps:",
        nextProps,
      );
      this.updateSlots();
    });

    onWillRender(() => {
      this.updateSlots();
      console.log("OwlReactWrapper onWillRender:", this.name);
    });

    onRendered(() => {
      console.log("OwlReactWrapper onRendered:", this.name);
    });
  }
  updateSlots() {
    if (this.props.slots) {
      const { callSlot } = helpers;
      const ctx = { props: this.props };
      const slots = Object.keys(ctx.props.slots ?? {}).reduce(
        (acc, k, index) => {
          acc[k] = callSlot(ctx, this.__owl__, `${index}`, k, false, null);
          return acc;
        },
        {} as any,
      );

      const { default: defaultSlot } = slots;
      
      delete slots.default;
      slots.children = wrapBlock(defaultSlot);
      this.slots = slots;
      console.log(
        "OwlReactWrapper slots:",
        { ...slots }
      );
    } else {
      this.slots = null;
    }
  }
  unmount(callback?: () => void) {
    const reactDomRoot: ReactDOM.Root | null = this.reactDomRoot;
    this.reactDomRoot = null;
    // wait one microtask to make sure that the react component is done rendering (logs errors otherwise)
    Promise.resolve().then(() => {
      try{
        reactDomRoot?.unmount();
      } finally{
        callback?.()
      }
    });
  }

  mount(parent: HTMLElement|DocumentFragment) {
    const reactCreateRoot = this.inTreeCreateRoot || ReactDOM.createRoot;
    this.reactDomRoot = reactCreateRoot(parent);
  }


  renderReact(onRender: () => void): void {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");
    if (!this.reactDomRoot) return;

    const { slots, ...reactProps } = this.props;
    let wrappers: any[] = [React.Fragment]; //this.angularReactService.wrappers;

    // unlike in React, where children passed in the body have precedence over props.children,
    // we can't know if childrenTmpl is empty or not, so props.children takes precedence
    const children =
      this.slots?.children ??
      this.props.children ??
      (this.childrenTmpl ? (
        <OwlTemplateOutlet tmpl={this.childrenTmpl} />
      ) : null);
    const Comp = this.component;
    const toBeRendered = (
      <RootOwlAppContextProvider owlApp={this.node.app}>
        {nestWrappers(
          wrappers,
          <ReactRender onRender={onRender}>
            <Comp {...this.slots} {...reactProps}>
              {children}
            </Comp>
          </ReactRender>,
        )}
      </RootOwlAppContextProvider>
    );

    this.reactDomRoot.render(toBeRendered);
    console.log("OwlReactWrapper renderReact:", this.name, ", root:",  this.node);
  }

  get rootElement() {
    console.log("OwlReactWrapper::rootElement");
    return this.rootEl;
  }
}

const nodeProto = Node.prototype;
const nodeInsertBefore = nodeProto.insertBefore;
const nodeRemoveChild = nodeProto.removeChild;

function hasCustomNode(afterNode: Node | null) {
  if(afterNode) {
    let cr:Node|null = afterNode;
    while(cr) {
      if(afterNode.nodeType === Node.TEXT_NODE) {
        if(!cr.textContent?.trim()){
          cr = cr.previousSibling;
          continue
        }
      }
      return true;
    }
  }
  return false;
}

class VOlwRapper implements Partial<VNode<VOlwRapper>> {
  //content: BDom | null;
  parent: HTMLElement | null = null;
  c: OwlReactWrapper<any>;
  content: ChildNode[] = [];
  reactEl: HTMLElement | null = null;
  customNode:Boolean = false;
  constructor(c: OwlReactWrapper<any>) {
    this.c = c;
  }

  mountNode(parent: HTMLElement, customNode:Boolean, afterNode: Node | null) {
    this.parent = parent;
    this.customNode = customNode;
    if (this.customNode){
      this.reactEl = document.createElement('react-wrap');
      nodeInsertBefore.call(parent, this.reactEl!, afterNode);
      this.c.mount(this.reactEl);
    } else{
      this.reactEl = parent
    }    
    this.c.mount(this.reactEl);
    this.c.renderReact(() => {

    });
  }
  mount(parent: HTMLElement, afterNode: Node | null) {
    this.mountNode(parent, hasCustomNode(afterNode), afterNode)
  }

  moveBeforeDOMNode(node: Node | null, parent = this.parent) {
    this.parent = parent;
    if(this.customNode) {
      nodeInsertBefore.call(parent, this.reactEl!, node);
    }
    else {
      let customNode = hasCustomNode(node);
      if(customNode) {
        this.c.unmount(()=> this.mount(parent!, node))
      }
    }
  }

  moveBeforeVNode(other: VOlwRapper | null, afterNode: Node | null) {
    const target = other ? other.reactEl : afterNode;
    this.moveBeforeDOMNode(target);
  }

  patch(other: VOlwRapper) {
    if (this === other) {
      return;
    }
    
    if (this.c != other.c || this.c.slots !== other.c.slots) {
      this.c.unmount(()=> {
        this.c = other.c;
        const parent = this.parent;
        // insert new html in front of current
        const afterNode = this.customNode ? this.reactEl : null;
        const hasSibling = !!afterNode?.previousSibling || !!afterNode?.nextSibling;
        this.mountNode(parent!, hasSibling, afterNode); 
        afterNode?.remove();
      })
    }
  }

  beforeRemove() {}

  remove() {
    this.c.unmount(()=> {
      if(this.customNode) {
        this.reactEl?.remove();
      }
      this.reactEl = null;
    })
  }

  firstNode(): Node {
    return this.customNode ? this.reactEl! : this.parent!;//this.parent?.childNodes?.item(0) ;//this.content[0]!;
  }

  toString() {
    return "ReactWrapper";
  }
}

function wrapBlock(block: any) {
  let children: React.ReactNode[] | null = null;
  if (block) {
    const el = document.createElement("template");
    block.mount(el);
    children = [];
    el.childNodes.forEach((e, key) => {
      children!.push(
        <Child key={`${key}`} el={e as HTMLElement} />,
      );
    });
  }
  return children;
}

/**
 * kind of similar to <t t-slot="default"/>, but it wraps it around a VPortal
 */
export function vOlwRapperTemplate(app: any, bdom: any, helpers: any) {
  let { callSlot } = helpers;
  return function template(ctx: any, node: any, key = ""): any {
    console.log("vOlwRapperTemplate call template node:", { ctx, node });
    return new VOlwRapper(ctx);
  };
}

const _EMPTY: React.DependencyList = [];
function ReactRender({
  onRender,
  children,
}: {
  onRender: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(onRender, _EMPTY);

  return children;
}
