import { RElement, RNode, Text } from "./base";
import { IElement, INode } from "./types";

export class RMulti extends RElement<RMulti> {
  mount(parent: IElement, afterNode: INode | null) {
    const children = this.children;
    const l = children.length;
    for (let i = 0; i < l; i++) {
      let child = children[i];
      if (child) {
        child.mount(parent, afterNode);
      } else {
      }
    }
    this.parent = parent;
  }

  moveBeforeDOMNode(node: RNode | null, parent = this.parent) {
    this.parent = parent;
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      let child = children[i];
      if (child) {
        child.moveBeforeDOMNode(node, parent);
      } else {
        //const anchor = anchors![i];
        //nodeInsertBefore.call(parent, anchor, node);
      }
    }
  }

  moveBeforeVNode(other: RMulti | null, afterNode: RNode | null) {
    if (other) {
      const next = other!.children[0];
      afterNode = next || null;
    }
    const children = this.children;
    //const parent = this.parent;
    for (let i = 0, l = children.length; i < l; i++) {
      let child = children[i];
      if (child) {
        child.moveBeforeVNode(null, afterNode);
      } else {
        //const anchor = anchors![i];
        //nodeInsertBefore.call(parent, anchor, afterNode);
      }
    }
  }
  patch(other: RMulti, withBeforeRemove: boolean) {
    if (this === other) {
      return;
    }
    const children1 = this.children;
    const children2 = other.children;
    //const anchors = this.anchors!;
    const parent = this.parent!;
    for (let i = 0, l = children1.length; i < l; i++) {
      const vn1 = children1[i];
      const vn2 = children2[i];
      if (vn1) {
        if (vn2) {
          vn1.patch(vn2, withBeforeRemove);
        } else {
          //const afterNode = vn1.firstNode()!;
          //const anchor = new Text("");
          //anchors[i] = anchor;

          //nodeInsertBefore.call(parentEl, anchor, afterNode);
          if (withBeforeRemove) {
            vn1.beforeRemove();
          }
          vn1.remove();
          children1[i] = undefined;
        }
      } else if (vn2) {
        children1[i] = vn2;
        //const anchor = anchors[i];
        vn2.mount(parent, vn2);
        //nodeRemoveChild.call(parentEl, anchor);
      }
    }
  }

  beforeRemove() {
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      if (child) {
        child.beforeRemove();
      }
    }
  }

  remove() {
    //const parent = this.parent;
    if (this.isOnlyChild) {
      //nodeSetTextContent.call(parentEl, "");
    } else {
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];
        if (child) {
          child.remove();
        } else {
          //nodeRemoveChild.call(parentEl, anchors![i]);
        }
      }
    }
  }

  toString(): string {
    return this.children.map((c) => (c ? c!.toString() : "")).join("");
  }
}
