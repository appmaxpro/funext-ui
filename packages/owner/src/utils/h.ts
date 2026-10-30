import isPropValid from "@emotion/is-prop-valid";
import styled from "@emotion/styled";
import React from "react";
import { EMPTY_OBJECT, EMPTY_RECORD } from "./constant";
import { cn } from "~/ui";
import * as ReactIs from "react-is";
import get from "lodash/get";
// Creates an array of React.createElement arguments in a performant way
function createArguments(component: any, properties: any, children: any) {
  var argLength = children.length + 2;
  var args = new Array(argLength);

  args[0] = component;
  args[1] = properties;
  for (var i = 0; i < children.length; i++) {
    var argsIndex = i + 2;
    args[argsIndex] = children[i];
  }

  return args;
}

// bind it to avoid mutating the original function
declare type Ht = (
  component: any,
  props: any,
  children?: any,
) => ReturnType<typeof React.createElement>;

interface H extends Ht {
  C: any;
}

function r(component: any, props: any, children?: any) {
  if (
    children == null &&
    props &&
    (props.constructor !== Object || React.isValidElement(props))
  ) {
    props = {children: Array.isArray(props) ? props : [props]};
  }

  console.log("R::FN:", { component, props, children });

  if (props != null) {
    props = { ...props };
    const className = props.className || props["class"] || undefined;
    if (typeof component === "string")
      props = Object.keys(props ?? EMPTY_RECORD)
        .filter(isPropValid)
        .reduce((prev, prop) => {
          prev[prop] = props[prop];
          return prev;
        }, {} as any);

    if (className) {
      props.className = cn(className);
      if (props["class"]) {
        delete props["class"];
      }
    }
  }

  // Don't use an array if there's only one child
  if (Array.isArray(children) && children.length <= 1) children = children[0];

  if (children == null) {
    return React.createElement(component, props);
  }

  if (props == null) {
    return React.createElement(component, { children });
  }

  // When there's only one child, call createElement normally
  // to achieve a minor performance gain
  if (!Array.isArray(children)) {
    return React.createElement(component, props, children);
  }

  // When many children, use apply to prevent unnecessary key warnings
  var args: any = createArguments(component, props, children);
  return React.createElement.apply(React, args);
}

let C: any = EMPTY_OBJECT;
let fns: any = EMPTY_OBJECT;
let proxies: any[] = [];

type CreateComponent = <P>(p: P) => React.ComponentType<P>;

// bind it to avoid mutating the original function
const ht: Ht = r.bind(null);
(ht as H).C = EMPTY_OBJECT;
const t = ht as H;

const h = new Proxy(t, {
  apply: (target, thisArg, argArray) => {
    return Reflect.apply(target, thisArg, argArray);
  },
  get: (target, prop, receiver) => {
    //console.log("get prop:",  "(", prop, "), has:", Reflect.has(target, prop))
    const value = Reflect.get(target, prop, receiver);
    if (value) {
      if (typeof value === "function") {
        return (value as any)._h_embed_ ? value : value.bind(null, target);
      }
      return value;
    }

    if (prop in styled) {
      const Comp = (styled as any)[prop]();
      const fn = target.bind(null, Comp);
      /*
      const fn = function (...children: any[]) {
        
        // Use .apply() or .call() to ensure the 'this' context (receiver) is correct
        //return target(prop, ...args);
        return target.apply([Comp, ...children]);
      };*/

      Object.assign(fn, { _h_embed_: 1 });
      (target as any)[prop] = fn;
      return fn;
    }

    let c = Reflect.get(C, prop, receiver);
    console.log("H::Proxy prop:", { prop, c });
    if (c) {
      return c;
    }
    let fn = Reflect.get(fns, prop, receiver);
    if (typeof fn === "function") {
      return fn.bind(target);
    }
    return fn;
  },
});

function expandFn(C: any) {
  C = { ...C };
  Object.keys(C).forEach((k) => {
    //Accept [A-Z] while A = 65 AND Z = 90
    if (
      k &&
      typeof k === "string" &&
      k.codePointAt(0)! > 64 &&
      k.codePointAt(0)! < 91 &&
      ReactIs.isValidElementType(C[k])
    ) {
      //const c = r.bind(null, C[k]);
      C[k] = Object.assign(r.bind(null, C[k]), C[k]);
      //proxies.push(main[key]);
    }
  });

  return Object.assign(r.bind(null, C), C);
}

const setC = (cc: any, ...expand: string[]) => {
  C = { ...cc };
  proxies = [];
  //expand.forEach(extended);
  Object.keys(C).forEach((k) => {
    if (expand.includes(k)) {
      C[k] = expandFn(C[k]);
    } else {
      C[k] = Object.assign(r.bind(null, C[k]), C[k]);
    }
  });
  console.log("H::Proxy::C:", C);
  console.log("H::Proxy::styled:", styled);
};

const setFns = (newFns: any) => (fns = newFns);

export { setC, setFns };

export default h;
