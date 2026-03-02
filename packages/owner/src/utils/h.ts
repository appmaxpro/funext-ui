import isPropValid from "@emotion/is-prop-valid";
import styled from "@emotion/styled";
import React from "react";
import { EMPTY_RECORD, omit, type BlockRenderProps } from ".";
import { cn } from "@funext/ui";

let render: BlockRenderProps | null = null;

let prev: {
  current: BlockRenderProps | null;
} = {
  current: null,
};

export const blockSet = {
  set: (current: BlockRenderProps) => {
    if (render) {
      prev.current = render;
    }
    render = current;
  },

  restore: () => {
    render = prev.current;
    prev.current = null;
  },
};
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

function r(component: any, props: any, children?: any) {
  if (props && props === render?.props) {
    const result = props();
    if (result?.children) {
      children = result?.children;
    }
  }
  // A properties object is optional so shift arguments if missing
  else if (!children && React.isValidElement(props)) {
    children = props;
    props = {};
  }

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

  
  if (Array.isArray(children) && children.length === 1) {
    children = children[0];
  }

  // When there's only one child, call createElement normally
  // to achieve a minor performance gain
  if (!Array.isArray(children)) {
    return React.createElement(component, props, children);
  } 
  // Don't use an array if there's only one child
  else if(children.length === 1) {
     children = children[0];
  }
  else if(children.length === 0) {
     return React.createElement.apply(React, props);
  }

  // When many children, use apply to prevent unnecessary key warnings
  var args: any = createArguments(component, props, children);
  return React.createElement.apply(React, args);
}

type CreateComponent = <P>(p: P) => React.ComponentType<P>;

const h = new Proxy(r, {
  apply: (target, thisArg, argArray) => {
    return Reflect.apply(target, thisArg, argArray);
  },
  get: (target, prop, receiver) => {
    //console.log("get prop:",  "(", prop, "), has:", Reflect.has(target, prop))
    if (Reflect.has(target, prop)) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        //return value;
        if ("$embed" in value) return value;
        return function (...args: any[]) {
          //console.log(`Method called: ${prop} with arguments: ${JSON.stringify(args)}`);
          // Use .apply() or .call() to ensure the 'this' context (receiver) is correct
          return value.apply(target, args);
        };
      }
      return value;
    }

    if (typeof prop === "string" && prop in styled) {
      const fn = function (props: any, ...children: any[]) {
        /*
        console.log(
          `Method target: ${prop} with arguments: ${JSON.stringify(args)}`,
        );
        */
        // Use .apply() or .call() to ensure the 'this' context (receiver) is correct
        //return target(prop, ...args);
        return r(prop, props, children);
      };
      Object.assign(fn, { $embed: 0 });
      Object.assign(target, { [prop]: fn });
      return fn;
    }
    return null;
  },
});

export default h;
