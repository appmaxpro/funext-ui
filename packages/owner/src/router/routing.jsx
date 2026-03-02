import {
  createElement as h,
  createContext,
  cloneElement,
  useContext,
  useMemo,
  useReducer,
  useLayoutEffect,
  useRef,
  isValidElement,
  useCallback,
  Children,
  useEffect,
} from "react";
import { prepareVNodeForRanking, pathRankSort, useLocationReducer, ActionType } from "./utils";
import { shallowEqual } from "~/utils";
import { strict } from "assert";

/**
 * @template T
 * @typedef {import('preact').RefObject<T>} RefObject
 * @typedef {import('./internal.d.ts').VNode} VNode
 */

/** @type {boolean} */
let push;
/** @type {string | RegExp | undefined} */
let scope;

/**
 * @param {string} href
 * @returns {boolean}
 */
function isInScope(href) {
  return (
    !scope ||
    (typeof scope == "string" ? href.startsWith(scope) : scope.test(href))
  );
}

/**
 * @param { strict | null } state
 * @param {MouseEvent | PopStateEvent | { url: string, replace?: boolean, state?: any }} action
 * @returns { url: string, action: 'push' | 'replace' | 'pop', state?: any }
 */
function getNavLink(state, action) {
  let url = "";
  var pushState = "pop";
  var newState = null;
  if (action && action.type === "click") {
    // ignore events the browser takes care of already:
    if (
      action.ctrlKey ||
      action.metaKey ||
      action.altKey ||
      action.shiftKey ||
      action.button !== 0
    ) {
      return state;
    }

    const link = action
        .composedPath()
        .find((el) => el.nodeName == "A" && el.href),
      href = link && link.getAttribute("href");
    if (
      !link ||
      link.origin != location.origin ||
      /^#/.test(href) ||
      !/^(_?self)?$/i.test(link.target) ||
      !isInScope(href) ||
      link.download
    ) {
      return state;
    }

    pushState = "PUSH";
    action.preventDefault();
    url = link.href.replace(location.origin, "");
    newState = action.state ?? link.state;
  } else if (state == null || typeof state === "string") {
    url = state ?? location.pathname + location.search;
    pushState = !!action.replace ? "replace" : "push";
    newState = action.state;
  } else {
    url = location.pathname + location.search;
    newState = history.state?.usr;
  }

  return { url, action: pushState, state: newState };
}

/**
 * @param {string} state
 * @param {MouseEvent | PopStateEvent | { url: string, replace?: boolean, state?: any }} action
 * @returns { url: string, action: 'push' | 'replace' | 'pop', state?: any }
 */
function handleNav(state, action) {
  const result = getNavLink(state, action);
  push = undefined;
  if (result === action) {
    return;
  }
  push = result.action === "push";
  if (result.action === "push") history.pushState(null, "", url);
  else if (result.action === "replace") history.replaceState(null, "", url);
  return result;
}

export const exec = (url, route, matches = {}) => {
  url = url.split("/").filter(Boolean);
  route = (route || "").split("/").filter(Boolean);
  if (!matches.params) matches.params = {};
  for (let i = 0, val, rest; i < Math.max(url.length, route.length); i++) {
    let [, m, param, flag] = (route[i] || "").match(/^(:?)(.*?)([+*?]?)$/);
    val = url[i];
    // segment match:
    if (!m && param == val) continue;
    // /foo/* match
    if (!m && val && flag == "*") {
      matches.rest = "/" + url.slice(i).map(decodeURIComponent).join("/");
      break;
    }
    // segment mismatch / missing required field:
    if (!m || (!val && flag != "?" && flag != "*")) return;
    rest = flag == "+" || flag == "*";
    // rest (+/*) match:
    if (rest) val = url.slice(i).map(decodeURIComponent).join("/") || undefined;
    // normal/optional field:
    else if (val) val = decodeURIComponent(val);
    matches.params[param] = val;
    if (!(param in matches)) matches[param] = val;
    if (rest) break;
  }
  return matches;
};


/**
 * @param {Object} props
 * @param {string | RegExp} [props.scope]
 * @param {import('preact').ComponentChildren} [props.children]
 */
export function LocationProvider(props) {
  // @ts-expect-error - props.url is not implemented correctly & will be removed in the future
  const [state, route] = useLocationReducer(props);

  if (props.scope) scope = props.scope;
  const wasPush = push === true;

  const acceptRoute = useMemo(() => new Set());

  const stateRef = useRef(state);

  const canRoute = useCallback(
    async (newState, go = false) => {
      let resolveCp = null;  
      const resolvePromise = Promise((resolve)=> {
        resolveCp = resolve
      })
      
      const callback = async (can, current) =>  {
        if (!can) {
          resolveCp(false);
          return
        }
        const allPromise = Array.from(acceptRoute).map((intercept) =>
          intercept(newState, current),
        );
        const result = await Promise.all(allPromise);
        if (result && go) {
          route({type: ActionType.UPDATE, payload: newState});
        }
        resolveCp(result);
      }
      const can = {
        state: newState,
        callback
      }
      route({type: ActionType.CAN_UPDATE, payload: can});
      const result = await resolvePromise
      return result;
    },
    [route, acceptRoute],
  );

  /*
   * @param {string} newUrl
   * @param {MouseEvent | PopStateEvent | { url: string, replace?: boolean, state?: any }} action
   */
  const doRoute = useCallback(
    async (newUrl, action) => {
      //const curState = typeof state === 'string' ? {url: state}
      const result = getNavLink(newUrl, action);
      if (result === newUrl) {
        return;
      }

      const { url, state, action } = result;
      const u =
        url && url !== stateRef.current.url
          ? new URL(url, location.origin)
          : null;
      const path = u
        ? u?.pathname.replace(/\/+$/g, "") || "/"
        : stateRef.current.path;

      // @ts-ignore-next
      const newValue = {
        url,
        path,
        query: u ? Object.fromEntries(u.searchParams) : stateRef.current.query,
        state,
        action,
      };

      return await canRoute(newValue, true);
    },
    [canRoute],
  );

  const value = useMemo(() => {
    stateRef.current = state;
    return {
      ...state,
      register: (intercept) => acceptRoute.add(intercept),
      unregister: (intercept) => acceptRoute.delete(intercept),
      canRoute,
      navigate: doRoute
    };
  }, [state, doRoute]);

  useLayoutEffect(() => {
    addEventListener("click", doRoute);
    addEventListener("popstate", doRoute);

    return () => {
      removeEventListener("click", doRoute);
      removeEventListener("popstate", doRoute);
    };
  }, [doRoute]);

  // @ts-ignore
  return h(LocationProvider.ctx.Provider, { value }, props.children);
}

const EMPTY = {};
const ROUTERS = [];
const SUBS = [];
let customHistory = null;
const assign = Object.assign;
const GLOBAL_ROUTE_CONTEXT = {
  url: getCurrentUrl(),
};

const RouterContext = createContext(GLOBAL_ROUTE_CONTEXT);

function useRouter() {
  const ctx = useContext(RouterContext);
  // Note: this condition can't change without a remount, so it's a safe conditional hook call
  if (ctx === GLOBAL_ROUTE_CONTEXT) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const update = useState()[1];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      SUBS.push(update);
      return () => SUBS.splice(SUBS.indexOf(update), 1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  }
  return [ctx, route];
}

function setUrl(url, type = "push") {
  if (customHistory && customHistory[type]) {
    customHistory[type](url);
  } else if (typeof history !== "undefined" && history[`${type}State`]) {
    history[`${type}State`](null, null, url);
  }
}

function getCurrentUrl() {
  let url;
  if (customHistory && customHistory.location) {
    url = customHistory.location;
  } else if (customHistory && customHistory.getCurrentLocation) {
    url = customHistory.getCurrentLocation();
  } else {
    url = typeof location !== "undefined" ? location : EMPTY;
  }
  return `${url.pathname || ""}${url.search || ""}`;
}

function route(url, replace = false) {
  if (typeof url !== "string" && url.url) {
    replace = url.replace;
    url = url.url;
  }

  // only push URL into history if we can handle it
  if (canRoute(url)) {
    setUrl(url, replace ? "replace" : "push");
  }

  return routeTo(url);
}

/** Check if the given URL can be handled by any router instances. */
function canRoute(url) {
  for (let i = ROUTERS.length; i--; ) {
    if (ROUTERS[i].canRoute(url)) return true;
  }
  return false;
}

/** Tell all router instances to handle the given URL.  */
function routeTo(url) {
  let didRoute = false;
  for (let i = 0; i < ROUTERS.length; i++) {
    if (ROUTERS[i].routeTo(url)) {
      didRoute = true;
    }
  }
  return didRoute;
}

function routeFromLink(node) {
  // only valid elements
  if (!node || !node.getAttribute) return;

  let href = node.getAttribute("href"),
    target = node.getAttribute("target");

  // ignore links with targets and non-path URLs
  if (!href || !href.match(/^\//g) || (target && !target.match(/^_?self$/i)))
    return;

  // attempt to route, if no match simply cede control to browser
  return route(href);
}

function prevent(e) {
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  if (e.stopPropagation) e.stopPropagation();
  e.preventDefault();
  return false;
}

// Handles both delegated and direct-bound link clicks
function delegateLinkHandler(e) {
  // ignore events the browser takes care of already:
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;

  let t = e.target;
  do {
    if (t.localName === "a" && t.getAttribute("href")) {
      if (t.hasAttribute("data-native") || t.hasAttribute("native")) return;
      // if link is handled by the router, prevent browser defaults
      if (routeFromLink(t)) {
        return prevent(e);
      }
    }
  } while ((t = t.parentNode));
}

let eventListenersInitialized = false;

function initEventListeners() {
  if (eventListenersInitialized) return;
  eventListenersInitialized = true;

  if (!customHistory) {
    addEventListener("popstate", () => {
      routeTo(getCurrentUrl());
    });
  }
  addEventListener("click", delegateLinkHandler);
}

/**
 * @class
 * @this {import('preact').Component}
 */
function Router(props) {
  if (props.history) {
    customHistory = props.history;
  }

  this.state = {
    url: props.url || getCurrentUrl(),
  };
}

// @ts-ignore-next-line
const RouterProto = (Router.prototype = new Component());

assign(RouterProto, {
  shouldComponentUpdate(props) {
    if (props.static !== true) return true;
    return (
      props.url !== this.props.url || props.onChange !== this.props.onChange
    );
  },

  /** Check if the given URL can be matched against any children */
  canRoute(url) {
    const children = toChildArray(this.props.children);
    return this._getMatchingChild(children, url) !== undefined;
  },

  /** Re-render children with a new URL to match against. */
  routeTo(url) {
    this.setState({ url });

    const didRoute = this.canRoute(url);

    // trigger a manual re-route if we're not in the middle of an update:
    if (!this._updating) this.forceUpdate();

    return didRoute;
  },

  componentWillMount() {
    this._updating = true;
  },

  componentDidMount() {
    initEventListeners();
    ROUTERS.push(this);
    if (customHistory) {
      this._unlisten = customHistory.listen((action) => {
        let location = action.location || action;
        this.routeTo(`${location.pathname || ""}${location.search || ""}`);
      });
    }
    this._updating = false;
  },

  componentWillUnmount() {
    if (typeof this._unlisten === "function") this._unlisten();
    ROUTERS.splice(ROUTERS.indexOf(this), 1);
  },

  componentWillUpdate() {
    this._updating = true;
  },

  componentDidUpdate() {
    this._updating = false;
  },

  _getMatchingChild(children, url) {
    children = children.filter(prepareVNodeForRanking).sort(pathRankSort);
    for (let i = 0; i < children.length; i++) {
      let vnode = children[i];
      let matches = exec(url, vnode.props.path, vnode.props);
      if (matches) return [vnode, matches];
    }
  },

  render({ children, onChange }, { url }) {
    let ctx = this.context;

    let active = this._getMatchingChild(toChildArray(children), url);
    let matches, current;
    if (active) {
      matches = active[1];
      current = cloneElement(
        active[0],
        assign(assign({ url, matches }, matches), {
          key: undefined,
          ref: undefined,
        }),
      );
    }

    if (url !== ctx?.url) {
      let newCtx = {
        url,
        previous: ctx && ctx.url,
        current,
        path: current ? current.props.path : null,
        matches,
      };

      // only copy simple properties to the global context:
      assign(GLOBAL_ROUTE_CONTEXT, (ctx = this._contextValue = newCtx));

      // these are only available within the subtree of a Router:
      ctx.router = this;
      ctx.active = current ? [current] : [];

      // notify useRouter subscribers outside this subtree:
      for (let i = SUBS.length; i--; ) SUBS[i]({});

      if (typeof onChange === "function") {
        onChange(ctx);
      }
    }

    return (
      <RouterContext.Provider value={ctx}>{current}</RouterContext.Provider>
    );
  },
});



const Link = (props) => h("a", assign({ onClick: delegateLinkHandler }, props));

const Route = (props) => h(props.component, props);

function Match(props) {
  const router = useRouter()[0];
  return props.children({
    url: router.url,
    path: router.path,
    matches: exec(router.path || router.url, props.path, {}) !== false,
  });
}

class Redirect extends Component {
  componentWillMount() {
    route(this.props.to, true);
  }

  render() {
    return null;
  }
}

//https://github.com/prateekbh/preact-async-route/blob/master/src/index.js
class AsyncRoute extends Component {
  constructor() {
    super();
    this.state = {
      componentData: null,
    };
  }
  loadComponent() {
    if (this.props.component) {
      return this.setState({
        componentData: this.props.component,
      });
    }
    const componentData = this.props.getComponent(
      this.props.url,
      ({ component }) => {
        // Named param for making callback future proof
        if (component) {
          this.setState({
            componentData: component,
          });
        }
      },
      assign({}, this.props, this.props.matches),
    );

    // In case returned value was a promise
    if (componentData && componentData.then) {
      // IIFE to check if a later ending promise was creating a race condition
      // Check test case for more info
      ((url) => {
        componentData.then((component) => {
          if (url !== this.props.url) {
            this.setState({ componentData: null }, () => {
              this.loadComponent();
            });
            return;
          }
          this.setState({
            componentData: component,
          });
        });
      })(this.props.url);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.path && this.props.path !== nextProps.path) {
      this.setState(
        {
          componentData: null,
        },
        () => {
          this.loadComponent();
        },
      );
    }
  }
  componentWillMount() {
    this.loadComponent();
  }
  render() {
    if (this.state.componentData) {
      return h(this.state.componentData, this.props);
    } else if (this.props.loading) {
      const loadingComponent = this.props.loading();
      return loadingComponent;
    }
    return null;
  }
}

export {
  getCurrentUrl,
  route,
  Router,
  Route,
  Link,
  exec,
  useRouter,
  Match,
  Redirect,
  AsyncRoute,
};
export default Router;
