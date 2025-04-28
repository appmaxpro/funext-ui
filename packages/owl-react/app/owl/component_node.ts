import {
  Component as OwlComponent,
  App,
  OwlError,
  //Component,
  ComponentNode,
  Fiber,
  blockDom as bdom,
  type ComponentConstructor,
  type BDom,
  RootFiber,
  mount,
  STATUS,
  blockDom
} from "@odoo/owl";

import { Component } from "react";
type Props = { [key: string]: any };


class ReactComponentNode extends Component {

  setup() {}
}


export class OwlComponentNode<P extends Props = any, E = any> extends ComponentNode {



}

type Position = "last-child" | "first-child";

type MountOptions = {
  position?: Position
};

export class MountFiber extends RootFiber {
  target: HTMLElement;
  position: Position;

  constructor(node: ComponentNode, target: HTMLElement, options: MountOptions = {}) {
    super(node, null);
    this.target = target;
    this.position = options.position || "last-child";
  }
  complete() {
    let current: Fiber | undefined = this;
    try {
      const node = this.node;
      node.children = this.childrenMap;
      (node.app.constructor as any).validateTarget(this.target);
      if (node.bdom) {
        // this is a complicated situation: if we mount a fiber with an existing
        // bdom, this means that this same fiber was already completed, mounted,
        // but a crash occurred in some mounted hook. Then, it was handled and
        // the new rendering is being applied.
        node.updateDom();
      } else {
        node.bdom = this.bdom;
        if (this.position === "last-child" || this.target.childNodes.length === 0) {
          blockDom.mount(node.bdom!, this.target);
        } else {
          const firstChild = this.target.childNodes[0];
          blockDom.mount(node.bdom!, this.target, firstChild);
        }
      }

      // unregistering the fiber before mounted since it can do another render
      // and that the current rendering is obviously completed
      node.fiber = null;

      node.status = STATUS.MOUNTED;
      this.appliedToDom = true;
      let mountedFibers = this.mounted;
      while ((current = mountedFibers.pop())) {
        if (current.appliedToDom) {
          for (let cb of current.node.mounted) {
            cb();
          }
        }
      }
    } catch (e) {
      this.node.app.handleError({ fiber: current as Fiber, error: e });
    }
  }
}
