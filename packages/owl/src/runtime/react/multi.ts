import { RElement, RNode, Text } from "./base";

const getDescriptor = (o: any, p: any) => Object.getOwnPropertyDescriptor(o, p)!;
const nodeProto = RNode.prototype;
const nodeInsertBefore = RElement.prototype.insertBefore;
const nodeSetTextContent = getDescriptor(nodeProto, "textContent").set!;
const nodeRemoveChild = RElement.prototype.removeChild;

export class RMulti extends RElement<RMulti> {
  anchors?: RNode[] | undefined;
  isOnlyChild?: boolean | undefined;

  mount(parent: RElement, afterNode: RNode | null) {
      const children = this.children;
      const l = children.length;
      const anchors = new Array(l);
      for (let i = 0; i < l; i++) {
        let child = children[i];
        if (child) {
          child.mount(parent, afterNode);
        } else {
          const childAnchor = new Text("");
          anchors[i] = childAnchor;
          nodeInsertBefore.call(parent, childAnchor, afterNode);
        }
      }
      this.anchors = anchors;
      this.parent = parent;
    }
  
    moveBeforeDOMNode(node: RNode | null, parent = this.parent) {
      this.parent = parent;
      const children = this.children;
      const anchors = this.anchors;
      for (let i = 0, l = children.length; i < l; i++) {
        let child = children[i];
        if (child) {
          child.moveBeforeDOMNode(node, parent);
        } else {
          const anchor = anchors![i];
          nodeInsertBefore.call(parent, anchor, node);
        }
      }
    }
  
    moveBeforeVNode(other: RMulti | null, afterNode: RNode | null) {
      if (other) {
        const next = other!.children[0];
        afterNode = (next ? next.firstNode() : other!.anchors![0]) || null;
      }
      const children = this.children;
      const parent = this.parent;
      const anchors = this.anchors;
      for (let i = 0, l = children.length; i < l; i++) {
        let child = children[i];
        if (child) {
          child.moveBeforeVNode(null, afterNode);
        } else {
          const anchor = anchors![i];
          nodeInsertBefore.call(parent, anchor, afterNode);
        }
      }
    }
  
    patch(other: RMulti, withBeforeRemove: boolean) {
      if (this === other) {
        return;
      }
      const children1 = this.children;
      const children2 = other.children;
      const anchors = this.anchors!;
      const parent = this.parent!;
      for (let i = 0, l = children1.length; i < l; i++) {
        const vn1 = children1[i];
        const vn2 = children2[i];
        if (vn1) {
          if (vn2) {
            vn1.patch(vn2, withBeforeRemove);
          } else {
            const afterNode = vn1.firstNode()!;
            const anchor = new Text("");
            anchors[i] = anchor;
            nodeInsertBefore.call(parent, anchor, afterNode);
            if (withBeforeRemove) {
              vn1.beforeRemove();
            }
            vn1.remove();
            children1[i] = undefined;
          }
        } else if (vn2) {
          children1[i] = vn2;
          const anchor = anchors[i];
          vn2.mount(parent, anchor);
          nodeRemoveChild.call(parent, anchor);
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
      const parent = this.parent;
      if (this.isOnlyChild) {
        nodeSetTextContent.call(parent, "");
      } else {
        const children = this.children;
        const anchors = this.anchors;
        for (let i = 0, l = children.length; i < l; i++) {
          const child = children[i];
          if (child) {
            child.remove();
          } else {
            nodeRemoveChild.call(parent, anchors![i]);
          }
        }
      }
    }
  
    firstNode(): RNode | undefined {
      const child = this.children[0];
      return child ? child.firstNode() : this.anchors![0];
    }
  
    toString(): string {
      return this.children.map((c) => (c ? c!.toString() : "")).join("");
    }
}
