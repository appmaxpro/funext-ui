import {
  Component as OwlComponent,
  App,
  OwlError,
  Component,
  ComponentNode,
  Fiber,
  blockDom as bdom,
  type ComponentConstructor,
  type BDom
} from "@odoo/owl";
import type { OwlRoot, OwlProps as Props } from "../components/types";
//import { vComponentTemplate } from "../components/owl-v-react";
//import { ReactOutlet } from "~/components/reac-outlet";
import { OwlReactWrapper, vOlwRapperTemplate } from "~/components/owl-react-wrapper";
import { extendsOwlComponent } from "~/utils/owl-component-factory";
import { portalTemplate, OwlPortal } from "./owl-portal";
import type { AppConfig } from "@odoo/owl/src/runtime/app";


export type Template = (context: any, vnode: any, key?: string) => BDom;

export type TemplateFunction = (app: OwlApp, bdom: any, helpers: any) => Template;

export class OwlApp<
T extends abstract new (...args: any) => any = any,
P extends object = any,
E = any
>  extends App {
  
  __wrapper__:Template;
  constructor(Root: ComponentConstructor<P, E>, config: AppConfig<P, E> = {}) {
    config.env ??= {} as any
    const env:any = config.env;
    env.components ??= {}
    env.components['OwlPortal'] ??= OwlPortal;
    super(Root, config);
    this.__wrapper__ = vOlwRapperTemplate(this, bdom, this.runtimeUtils);
    this.templates["__wrapper__"] = this.__wrapper__;
  }

  createComponent<P extends Props>(
    name: string | null,
    isStatic: boolean,
    hasSlotsProp: boolean,
    hasDynamicPropList: boolean,
    propList: string[],
  ) {
    const isDynamic = !isStatic;
    let arePropsDifferent: (p1: Object, p2: Object) => boolean;
    const hasNoProp = propList.length === 0;
    if (hasSlotsProp) {
      arePropsDifferent = (_1, _2) => true;
    } else if (hasDynamicPropList) {
      arePropsDifferent = function (props1: Props, props2: Props) {
        for (let k in props1) {
          if (props1[k] !== props2[k]) {
            return true;
          }
        }
        return Object.keys(props1).length !== Object.keys(props2).length;
      };
    } else if (hasNoProp) {
      arePropsDifferent = (_1: any, _2: any) => false;
    } else {
      arePropsDifferent = function (props1: Props, props2: Props) {
        for (let p of propList) {
          if (props1[p] !== props2[p]) {
            return true;
          }
        }
        return false;
      };
    }

    const updateAndRender = ComponentNode.prototype.updateAndRender;
    const initiateRender = ComponentNode.prototype.initiateRender;

    return (props: P, key: string, ctx: ComponentNode, parent: any, C: any) => {
      let children = ctx.children;
      let node: any = children[key];
      if (isDynamic && node && node.component.constructor !== C) {
        node = undefined;
      }
      console.log("OwlApp create component:", name);
      const parentFiber = ctx.fiber!;
      if (node) {
        console.log("OwlApp updateAndRender component:", name);
        if (
          arePropsDifferent(node.props, props) ||
          parentFiber.deep ||
          node.forceNextRender
        ) {
          node.forceNextRender = false;
          updateAndRender.call(node, props, parentFiber);
        }
      } else {
        // new component
        if (isStatic) {
          const CC = parent.constructor;
          setupReact(CC);

          const ReactComp =
            CC.reacts?.[name as any] ?? this.env.reacts?.[name as any];
          C =
            CC.components?.[name as any] ?? this.env.components?.[name as any];

          if (!C) {
            throw new OwlError(
              `Cannot find the definition of component "${name}" in "${CC.name}"`,
            );
          } else if (!(C.prototype instanceof Component)) {
            throw new OwlError(
              `"${name}" is not a Component. It must inherit from the Component class`,
            );
          }

          if (ReactComp) {
            console.log("OwlApp create react component props:", name);
            props = {
              inTreeCreateRoot: this.env.inTreeCreateRoot,
              isTopLevelReact: !this.env.inTreeCreateRoot,
              __reactName: name,
              ...props,
              component: ReactComp,
            };
          }
        } else {
          console.log("OwlApp create dynamic component:", name);
        }

        node = new ComponentNode(C, props, this, ctx, key);
        children[key] = node;
        initiateRender.call(node, new Fiber(node, parentFiber));
      }
      parentFiber.childrenMap[key] = node;
      return node;
    };
  }

  getTemplate(name: string): Template {
    //console.log("OwlApp getTemplate:", name);
    if (name === '__wrapper__') 
      return this.__wrapper__
    return super.getTemplate(name);
  }

}

function setupReact(CC: any) {
  if (!CC.__wrapped__) {
    CC.__wrapped__ = true;
    if (CC.components) {
      Object.values(CC.components).map(setupReact);
    }
    if (CC.reacts) {
      CC.components ??= {};
      console.log("OwlApp wrap reacts:", Object.keys(CC.reacts));
      Object.entries(CC.reacts).forEach(([k, v]) => {
        console.log("OwlApp create react component:", k);
        CC.components[k] = extendsOwlComponent(k, v, OwlReactWrapper);
      });
    }
  }
}



export function registerTemplate(key:string, tpl:TemplateFunction) {
  OwlApp.registerTemplate(key, portalTemplate);
}

//registerTemplate("__wrapper__", vOlwRapperTemplate);
//registerTemplate("_owl_portal_", portalTemplate);

//OwlApp.registerTemplate("__react__", vComponentTemplate);
