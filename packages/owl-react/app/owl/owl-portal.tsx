import {
  onMounted,
  onWillUnmount,
  Component,
  OwlError,
  type VNode,
  type BDom ,
  blockDom
} from "@odoo/owl";

const VText: any = blockDom.text("").constructor;

class VOwlPortal extends VText implements Partial<VNode<VOwlPortal>> {
  content: BDom | null;
  target: HTMLElement | null = null;
  
  constructor(content: BDom) {
    super("");
    this.content = content;
  }

  mount(parent: HTMLElement, anchor: ChildNode) {
    super.mount(parent, anchor);
    if (this.target) {
      this.content!.mount(this.target!, null);
    } else {
      this.content!.mount(parent, anchor);
    }
  }

  beforeRemove() {
    this.content!.beforeRemove();
  }
  remove() {
    if (this.content) {
      super.remove();
      this.content!.remove();
      this.content = null;
    }
  }

  patch(other: VOwlPortal) {
    super.patch(other);
    if (this.content) {
      this.content.patch(other.content!, true);
    } else {
      this.content = other.content;
      this.content!.mount(this.target!, null);
    }
  }
}

/**
 * kind of similar to <t t-slot="default"/>, but it wraps it around a VPortal
 */
export function portalTemplate(app: any, bdom: any, helpers: any) {
  let { callSlot } = helpers;
  return function template(ctx: any, node: any, key = ""): any {
    console.log("OwlPortalTemplate call template bdom:", bdom);
    return new VOwlPortal(
      callSlot(ctx, node, key, "default", false, null),
    );
  };
}

export class OwlPortal extends Component {
  static template = "_owl_portal_";
  static props = {
    target: {
      type: "*",
    },
    rootEl: {
      type: "*",
    },
    slots: true,
  } as const;

  setup() {
    const node: any = this.__owl__;

    onMounted(() => {
      console.log("Portal props:", this.props);
      const portal: VOwlPortal = node.bdom;
      if (!portal.target) {
        const target: HTMLElement =
          this.props.target instanceof HTMLElement
            ? this.props.target
            : document.querySelector(this.props.target);
        if (target) {
          portal.content!.moveBeforeDOMNode(target.firstChild, target);
        } else {
          throw new OwlError("invalid portal target");
        }
      }
    });

    onWillUnmount(() => {
      const portal: VOwlPortal = node.bdom;
      portal.remove();
    });
  }
}
