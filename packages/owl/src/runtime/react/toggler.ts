import { RNode } from "./base";
import type { VNode } from "./index";
import { IElement, INode } from "./types";

// -----------------------------------------------------------------------------
// Toggler node
// -----------------------------------------------------------------------------

class VToggler extends RNode<VToggler>{
  key: string;
  child: VNode;

  constructor(key: string, child: VNode) {
    super();
    this.key = key;
    this.child = child;
  }

  mount(parent: IElement, afterNode: INode | null) {
    this.parent = parent;
    this.child.mount(parent, afterNode);
  }

  moveBeforeDOMNode(node: INode | null, parent?: IElement) {
    this.child.moveBeforeDOMNode(node, parent);
  }

  moveBeforeVNode(other: VToggler | null, afterNode: INode | null) {
    this.moveBeforeDOMNode((other && other.firstNode()) || afterNode);
  }

  patch(other: VToggler, withBeforeRemove: boolean) {
    if (this === other) {
      return;
    }
    let child1 = this.child;
    let child2 = other.child;
    if (this.key === other.key) {
      child1.patch(child2, withBeforeRemove);
    } else {
      child2.mount(this.parent!, child1.firstNode()!);
      if (withBeforeRemove) {
        child1.beforeRemove();
      }
      child1.remove();
      this.child = child2;
      this.key = other.key;
    }
  }

  beforeRemove() {
    this.child.beforeRemove();
  }

  remove() {
    this.child.remove();
  }

  firstNode() {
    return this.child!.firstNode() as any;
  }

  toString(): string {
    return this.child.toString();
  }
}

export function toggler(key: string, child: VNode): VNode<VToggler> {
  return new VToggler(key, child);
}
