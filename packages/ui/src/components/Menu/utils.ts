import React from "react";

import { isElementHidden } from "../List/utils";
import { isRecord } from "../../lib/isRecord";

let _validTypes: Array<any> = [];
export const setValidItemTypes = (...types: any) => {
  _validTypes = [..._validTypes, ...types];
};

export const isValidItemType = (comp: any) => _validTypes.includes(comp.type);

export const isMenuItemValid = (comp: any) => {
  const valid =
    !isMenuItemDisabled(comp) &&
    (isValidItemType(comp) || comp.props?.role === "menuitem");
  //console.log("isMenuItemValid not Disabled:", !isMenuItemDisabled(comp),  ",menuitem:", comp.props?.role === 'menuitem', ", valid:", valid, ', type:', comp.type);

  return valid;
};

export const isMenuItemDisabled = (comp: any) =>
  !comp ||
  comp.props?.disabled ||
  comp.props?.["area-disabled"] ||
  comp.props?.["area-hidden"];

export const pickAnimation = (anim: any) => {
  return {
    ...pickMount(anim.mount, "mount", "trans"),
    ...pickMount(anim.unmount, "unmount", "untrans"),
  };
};

export const pickMount = (anim: any, name1: string, name2: string) => {
  const { transform, ...other } = anim;

  return {
    [name1]: other,
    [name2]: transform,
  };
};

export function setRef(element: HTMLElement | null, ref: React.ForwardedRef<HTMLElement>){
    if (typeof  ref === 'function'){
      ref(element);
    }
    else if (isRecord(ref)){
      ref.current = element
    }
}
