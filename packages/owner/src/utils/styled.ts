import isPropValid from "@emotion/is-prop-valid";
import React from "react";

// Creates an array of React.createElement arguments in a performant way
function createArguments(component:any, properties:any, children:any) {
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

const createComponent =
  (component:React.ComponentType, displayName?:string) => {
    
    function useElement(inProps: any) {
      return React.useMemo(() => {
        let { as, ...props } = inProps;
        let Component = component;
        if (typeof component === "string") {
          Component = as || component;
          as = undefined;
        }
        const result = Object.keys(props)
          .filter(isPropValid)
          .reduce((prev, prop) => {
            prev[prop] = props[prop];
            return prev;
          }, {} as any);

        const className = result.className || result['class'] || undefined;
        const attrs = { ...result, className, as };

        return React.createElement(Component, attrs);
      }, [inProps]);
    }

    const Comp:React.ComponentType = ((props:any) => {
      return  useElement(props);
    });

    Comp.displayName = displayName
      ? displayName
      : `Styled(${
          typeof component === "string"
            ? component
            : component.displayName || component.name || "Component"
        })`;

    return Comp;
  };

type CreateComponent = <P>(p: P) => React.ComponentType<P>;

const comp = new Proxy(createComponent, {
  apply: (target, thisArg, argArray) =>
    Reflect.apply(target, thisArg, argArray),
  get: (target, prop, receiver) =>
    Reflect.has(target, prop)
      ? Reflect.get(target, prop, receiver)
      : typeof prop === "string"
        ? target(prop as any)
        : null,
}) as CreateComponent;

export default comp;
/*
declare const codegen: { require: (path: string) => any }

// eslint-disable-next-line no-undef
const reactPropsRegex: RegExp = codegen.require('./props')

export function memoize<V>(fn: (arg: string) => V): (arg: string) => V {
  const cache: Record<string, V> = Object.create(null)

  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg)
    return cache[arg]
  }
}

*/