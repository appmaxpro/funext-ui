import { useEffect, useState } from 'react';
//import { isBrowser, off, on } from './misc/util';
const isBrowser = typeof window !== undefined


const patchHistoryMethod = (method: 'pushState' | 'replaceState') => {
  //const method = 
  const history = window.history;
  const original = history[method];

  history[method] = function (state) {
    //@ts-ignore
    const result = original.apply(this, arguments);
    const event = new Event(method.toLowerCase());

    (event as any).state = state;

    window.dispatchEvent(event);

    return result;
  };
};

if (isBrowser) {
  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
}

export interface LocationSensorState {
  trigger: string;
  state?: any;
  length?: number;
  hash?: string;
  host?: string;
  hostname?: string;
  href?: string;
  origin?: string;
  pathname?: string;
  port?: string;
  protocol?: string;
  search?: string;
  params?: Record<string,any>;
}

const useLocationServer = (): LocationSensorState => ({
  trigger: 'load',
  length: 1,
});

let lastParams:any = null
let lastSearch:any = null
function getParams(search: string) {
  if (search === lastSearch) return lastParams;

  lastSearch = search;

  lastParams = search && search.length ? new URL(search).searchParams : null;
  return lastParams
}

const buildState = (trigger: string) => {
  const { state, length } = window.history;

  const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;

  return {
    trigger,
    state,
    length,
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search,
    params: getParams(search)
  };
};

const events = ['popstate', 'pushstate', 'replacestate'] as const
const useLocationBrowser = (): LocationSensorState => {
  const [state, setState] = useState(buildState('load'));

  useEffect(() => {
    const onPopstate = () => setState(buildState('pop'));
    const onPushstate = () => setState(buildState('push'));
    const onReplacestate = () => setState(buildState('replace'));
    //events.forEach(event => )
    window.addEventListener('popstate', onPopstate)
    window.addEventListener('pushstate', onPushstate)
    window.addEventListener('replacestate', onReplacestate)
    
    return () => {
      window.removeEventListener('popstate', onPopstate)
      window.removeEventListener('pushstate', onPushstate)
      window.removeEventListener('replacestate', onReplacestate)
    };
  }, []);

  return state;
};

const hasEventConstructor = typeof Event === 'function';

export default isBrowser && hasEventConstructor ? useLocationBrowser : useLocationServer;