import { IElement, INode, IText } from "./types";

export interface VNode<T = any> extends  INode{
  mount(parent: IElement, afterNode: INode | null): void;
  moveBeforeDOMNode(node: INode | null, parent?: IElement): void;
  moveBeforeVNode(other: T | null, afterNode: INode | null): void;
  patch(other: T, withBeforeRemove: boolean): void;
  beforeRemove(): void;
  remove(): void;
  firstNode(): INode | undefined;

  el?: undefined | IElement | IText;
  isOnlyChild?: boolean | undefined;
  key?: any;
}

export type BDom = VNode<any>;

export function mount(vnode: VNode, fixture: IElement, afterNode: Node | null = null) {
  vnode.mount(fixture, afterNode);
}

export function patch(vnode1: VNode, vnode2: VNode, withBeforeRemove: boolean = false) {
  vnode1.patch(vnode2, withBeforeRemove);
}

export function remove(vnode: VNode, withBeforeRemove: boolean = false) {
  if (withBeforeRemove) {
    vnode.beforeRemove();
  }
  vnode.remove();
}

export function withKey(vnode: VNode, key: any) {
  vnode.key = key;
  return vnode;
}
