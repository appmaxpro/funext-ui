
import type{Component, MountOptions, ComponentNode} from "@odoo/owl";

export type OwlProps = { [key: string]: any };

export interface OwlRoot<P extends OwlProps, E> {
  node: ComponentNode<P, E>;
  mount(target: HTMLElement | ShadowRoot, options?: MountOptions): Promise<Component<P, E>>;
  destroy(): void;
}

export type ChildrenPropsAsReactNode<T extends Record<string, any>> = {
  [K in keyof T]: K extends "children" ? React.ReactNode : T[K];
};

export type TreeNode = OwlInit & {
  reactComponent: React.FunctionComponent<any> | React.ComponentClass<any>;
  key: string;
  autoKey: number;
  nodes: TreeNode[];
  rerender?: (source?: "hooks") => void;
  unroot?: () => void;
};

export type OwlInit = {
  props: { reactProps: Record<string, any>; children: React.ReactNode }; // The react props
  portalTarget: HTMLElement | undefined; // An element to portal the React component into
  childrenSource: HTMLElement | undefined; // An element containing the children from Svelte, inject as children into the React component
  slotSources: HTMLElement[]; // An array of elements containing the slots from Svelte, inject as partials into the React component
  owlChildren: any | undefined; // The svelte children prop (snippet/slot)
  context: Map<any, any>; // The full Svelte context
  hooks: { Hook: React.FunctionComponent; key: number }[];
  parent?: TreeNode;
};