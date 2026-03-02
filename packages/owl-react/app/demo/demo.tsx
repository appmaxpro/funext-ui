"use client";
// In this example, we show how one can design an application that is responsive:
// its UI is different in mobile mode or in desktop mode.
//
// The main idea is to have a "isMobile" key in the environment, then listen
// to resize events and update the env if needed.  Then, the whole interface
// will be updated, creating and destroying components as needed.
//
// To see this in action, try resizing the window.  The application will switch
// to mobile mode whenever it has less than 768px.
import {
  Component,
  useState,
  onMounted,
  onWillUnmount,
  reactive,
  useEnv,
  useRef,
  getCurrent
} from "@odoo/owl";

import { ReactOwlWrapper } from "~/components/react-owl-wrapper";
import { createOwlApp } from "~/owl/start";
import { registerAllTemplate } from "~/owl/templates";
import "./demo.css";
import { RootOwlAppContextProvider } from "~/components/owl-context";
import * as React from "react";
import { useInTreeCreateRoot } from "~/hooks/use-in-tree-create-root";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function debounce(func: () => void, wait: number = 0, immediate = false) {
  let timeout: NodeJS.Timeout | undefined;
  return function () {
    //@ts-ignore
    const context: any = this;
    const args: IArguments = arguments;
    function later() {
      timeout = undefined;
      if (!immediate) {
        func.apply(context, args as any);
      }
    }
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args as any);
    }
  };
}

//------------------------------------------------------------------------------
// Responsive hook
//------------------------------------------------------------------------------

function createUI() {
  const getIsMobile = () => window.innerWidth <= 768;

  const ui = reactive({ isMobile: getIsMobile() });

  const updateEnv = debounce(() => {
    const isMobile = getIsMobile();
    if (ui.isMobile !== isMobile) {
      ui.isMobile = isMobile;
    }
  }, 15);
  window.addEventListener("resize", updateEnv);
  return ui;
}

function useUI() {
  const env = useEnv();
  return useState(env.ui);
}

//------------------------------------------------------------------------------
// Components
//------------------------------------------------------------------------------
class Navbar extends Component {
  static template = "Navbar";
}

class MobileSearchView extends Component {
  static template = "MobileSearchView";
}

class ControlPanel extends Component {
  static template = "ControlPanel";
  static components = { MobileSearchView };
  ui: any;
  setup() {
    console.log("ControlPanel setup:", getCurrent())
    let complete = false;
    try{
      this.ui = useUI();
      complete = true;
    } finally{
      console.log("ControlPanel current:", getCurrent(), ", complete:", complete)
    }
    
    
  }
}

class AdvancedComponent extends Component {
  static template = "AdvancedComponent";
  static reacts = { ReactButton };
  state: any;
  setup() {
    this.state = useState({ counter: 0, reactCounter: 0 });
    this.onRectClick = this.onRectClick.bind(this)
  }
  onClick() {
    this.state.counter += 1;
  }
  onRectClick() {
    console.log("onRectClick");
    this.state.reactCounter += 1;
  }
}

class FormView extends Component {
  static template = "FormView";
  static components = { AdvancedComponent };
  ui: any;
  setup() {
    this.ui = useUI();
  }
}

class Chatter extends Component {
  static template = "Chatter";
  messages: any[] | undefined;

  setup() {
    this.messages = Array.from(Array(100).keys());
  }
}

function ReactButton(props: any) {
  console.log("ReactButton:",props)
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded-md outline-0 text-white cursor-pointer border-0"
      {...props}
      onClick={()=> {
        console.log("ReactButton onClick")
        props.onClick?.();
        
      }}
    />
  );
}

export class Root extends Component {
  static template = "Root";
  static components = { Navbar, ControlPanel, FormView, Chatter };
  ui: any;
  ref: any;
  my_tag: string = 'div';
  setup() {
    this.ui = useUI();
    this.ref = useRef("root-ref");
    this.my_tag = 'div';

    onMounted(() => {
      console.log(
        "Root onMounted props:", this.props, "\nnode:", this.__owl__
      );
      const el = this.__owl__.el ?? this.__owl__.bdom?.el;
      const ref = this.props.ref;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref && "current" in ref) {
        ref.current = ref;
      }
    });
    onWillUnmount(() => {
      console.log("Root onWillUnmount");
      const ref = this.props.ref;
      if (typeof ref === "function") {
        ref(null);
      } else if (ref && "current" in ref) {
        ref.current = null;
      }
    });
  }
}

//------------------------------------------------------------------------------
// Application Startup
//------------------------------------------------------------------------------
export const demoEnv = {
  ui: createUI(),
  inTreeCreateRoot: useInTreeCreateRoot
};
let xmlLoaded = false;
const loadXml = registerAllTemplate("/app/demo/demo.xml").then((loaded) => {
  xmlLoaded = !!loaded;
  return xmlLoaded;
});

export class ReactRoot extends Component {}

export function createReactRoot() {

  const [loaded, setLoaded] = React.useState(xmlLoaded);

  const rootContainer = useInTreeCreateRoot()

  const app = React.useMemo(
    () => createOwlApp(ReactRoot as any, { env: {
      ...demoEnv, 
      inTreeCreateRoot: (container:any)=> rootContainer.createRoot(container)} }),
    [rootContainer],
  );

  React.useEffect(() => {
    if (!xmlLoaded) {
      loadXml.then((loaded) => {
        setLoaded(xmlLoaded);
      });
    } else {
      setLoaded((loaded) => xmlLoaded)
    }
  });

  if (!loaded) {
    return <span>Loading xml ...</span>;
  }
  return (
    <RootOwlAppContextProvider owlApp={app}>
      <ReactOwlWrapper component={Root} name="Root" app={app} />
    </RootOwlAppContextProvider>
  );
}

//mount(Root, document.body, { templates: TEMPLATES, env, dev: true });
