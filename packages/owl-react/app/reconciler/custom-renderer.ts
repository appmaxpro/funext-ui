import ReactReconciler from "react-reconciler";
import {
  // NoEventPriority,
  ContinuousEventPriority,
  DiscreteEventPriority,
  DefaultEventPriority,
  ConcurrentRoot,
} from "react-reconciler/constants.js";

function traceWrap(hostConfig: any): any {
  let traceWrappedHostConfig: any = {};
  Object.keys(hostConfig).map((key) => {
    const func = hostConfig[key];
    traceWrappedHostConfig[key] = (...args: any[]) => {
      console.trace(key);
      return func(...args);
    };
  });
  return traceWrappedHostConfig;
}

const rootHostContext = {};
const childHostContext = {};

const hostConfig = {
  now: Date.now,
  getRootHostContext: () => {
    return rootHostContext;
  },
  prepareForCommit: () => {},
  resetAfterCommit: () => {},
  getChildHostContext: () => {
    return childHostContext;
  },
  shouldSetTextContent: (type: string, props: any) => {
    return (
      typeof props?.children === "string" || typeof props?.children === "number"
    );
  },
  /**
   This is where react-reconciler wants to create an instance of UI element in terms of the target. Since our target here is the DOM, we will create document.createElement and type is the argument that contains the type string like div or img or h1 etc. The initial values of domElement attributes can be set in this function from the newProps argument
   */
  createInstance: (
    type: string,
    newProps: any,
    rootContainerInstance: any,
    _currentHostContext: any,
    workInProgress: any,
  ) => {
    const domElement = document.createElement(type);
    Object.keys(newProps).forEach((propName) => {
      const propValue = newProps[propName];
      if (propName === "children") {
        if (typeof propValue === "string" || typeof propValue === "number") {
          //@ts-ignore
          domElement.textContent = propValue;
        }
      } else if (propName === "onClick") {
        domElement.addEventListener("click", propValue);
      } else if (propName === "className") {
        domElement.setAttribute("class", propValue);
      } else {
        const propValue = newProps[propName];
        domElement.setAttribute(propName, propValue);
      }
    });
    return domElement;
  },
  createTextInstance: (text: string) => {
    return document.createTextNode(text);
  },
  appendInitialChild: (parent: HTMLElement, child: Node) => {
    parent.appendChild(child);
  },
  appendChild(parent: HTMLElement, child: Node) {
    parent.appendChild(child);
  },
  finalizeInitialChildren: (
    domElement: HTMLElement,
    type: string,
    props: any,
  ) => {},
  supportsMutation: true,
  appendChildToContainer: (parent: HTMLElement, child: Node) => {
    parent.appendChild(child);
  },
  prepareUpdate(domElement: HTMLElement, oldProps: any, newProps: any) {
    return true;
  },
  commitUpdate(
    domElement: HTMLElement,
    updatePayload: any,
    type: string,
    oldProps: any,
    newProps: any,
  ) {
    Object.keys(newProps).forEach((propName) => {
      const propValue = newProps[propName];
      if (propName === "children") {
        if (typeof propValue === "string" || typeof propValue === "number") {
          //@ts-ignore
          domElement.textContent = propValue;
        }
      } else {
        const propValue = newProps[propName];
        domElement.setAttribute(propName, propValue);
      }
    });
  },
  commitTextUpdate(textInstance: any, oldText: any, newText: any) {
    textInstance.text = newText;
  },
  removeChild(parentInstance: HTMLElement, child: Node) {
    parentInstance.removeChild(child);
  },
};

// Report when an error was detected in a previous render
// https://github.com/facebook/react/pull/23207
function logRecoverableError(error: any): void {
  // In modern browsers, reportError will dispatch an error event,
  // emulating an uncaught JavaScript error.
  if (typeof reportError === "function") return reportError(error);
  // In older browsers and test environments, fallback to console.error.
  else return console.error(error);
}

const reconciler = ReactReconciler(traceWrap(hostConfig));

const Root = class {
  _rootContainer: any;

  render(component: any, el: any, callback: any) {
    if (!this._rootContainer) {
      this._rootContainer = (reconciler as any).createContainer(
        el, // containerInfo
        ConcurrentRoot, // tag
        null, // hydrationCallbacks
        false, // isStrictMode
        null, // concurrentUpdatesByDefaultOverride
        "", // identifierPrefix
        logRecoverableError, // onUncaughtError
        logRecoverableError, // onCaughtError
        logRecoverableError, // onRecoverableError
        null, // transitionCallbacks
      );
    }
    reconciler.updateContainer(component, this._rootContainer, null, callback);
  }

  unmount() {
    this._rootContainer = null;
  }
};

export default Root;
