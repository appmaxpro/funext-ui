import type { VNode } from "./index";
import type { INode, IElement, IText } from "./types";

export abstract class RNode<T = any> implements INode, VNode<T>{
  moveBeforeDOMNode(node: INode | null, parent?: IElement): void {
    throw new Error("Method not implemented.");
  }
  moveBeforeVNode(other: T | null, afterNode: INode | null): void {
    throw new Error("Method not implemented.");
  }
  patch(other: T, withBeforeRemove: boolean): void {
    throw new Error("Method not implemented.");
  }
  beforeRemove(): void {
    throw new Error("Method not implemented.");
  }
  //el?: IElement | IText | undefined;
  isOnlyChild?: boolean | undefined;
  key?: any;
  _parent?: IElement<INode>;
  _dirty?: boolean;

  mount(parent: IElement, afterNode: INode | null) {
    parent.insertBefore(this as INode, afterNode);
  }

  remove() {
    this.parent?.removeChild(this);
  }

  get parent() {
    return this._parent;
  }

  set parent(parent: IElement|undefined){
    this._dirty = this._dirty || this._parent !== parent;
    this._parent = parent;
  } 
  

  firstNode():RNode|undefined {
    return this;
  }

  set textContent(text:string) {
    this._parent?.insertBefore(new Text(text), this);
    this.remove();
  }

  get textContent() {
    return ''
  }

}

type ChildType = RNode|undefined;

export abstract class RElement<T = any, C extends ChildType=any> 
  extends RNode<T> implements IElement<RNode> {
   
  children: Array<ChildType> = [];

  constructor(children?: Array<ChildType>) {
    super();
    this.children = children || []
  }

  insertBefore (node: RNode, beforeNode?: INode| null) {
    
    if (beforeNode) {
      const ch = this.children;
      const index = ch.findIndex(c => c === beforeNode);
      this.add(node, index)
    } else {
      this.appendChild(node)
    }
    
  }

  appendChild (node: RNode){
    
    if (node.parent) {
        node.remove();
    }
    this.children.push(node);
    this._dirty = true;
    node.parent = this;
  }

  add (node: RNode, index: number){
    if (node.parent) {
        node.remove();
    }
    this._dirty = true;

    const ch = this.children;
    if (index <= 0) {
      ch.unshift(node);
    } else if(index === ch.length -1) {
      this.appendChild(node)
    } 
    else {
      const deleted = ch.splice(index);
      this.appendChild(node);
      ch.push(...deleted)
    }
    node.parent = this;
  }

  removeChild(node: INode){
    const ch = this.children;
    const index = ch.findIndex(c => c === node)
    if (index >= 0) {
      this._dirty = true;
      this.children.splice(index, 1);
      node.parent = null;
    }
  }

  firstNode():RNode|undefined {
    return this.children[0];
  }

   

}


export class Text extends RNode{

  text:string;
  constructor(text:string){
     super();
     this.text = text;
  }

  moveBeforeDOMNode(node: RNode | null, parent = this.parent) {
    (parent ?? node?.parent)?.insertBefore(this, node);
  }

  moveBeforeVNode(other: Text | null, afterNode: RNode | null) {
    (other?.parent ?? this.parent)?.insertBefore(this, other ? other : afterNode);
  }

  get textContent() {
    return this.text;
  }

}

export function toText(value: any): string {
  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return String(value);
    case "boolean":
      return value ? "true" : "false";
    default:
      return value || "";
  }
}
