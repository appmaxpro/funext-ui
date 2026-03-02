import { shallowEqual } from "~/utils";
import type { RouteLocation } from "./router";
import { useReducer, type Reducer } from "react";

const EMPTY = {};

export function exec(path: string, subpath: string | null, opts: any) {
  let reg = /(?:\?([^#]*))?(#.*)?$/,
    c = path.match(reg),
    matches: Record<string, string> = {},
    ret;
  if (c && c[1]) {
    let p = c[1].split("&");
    for (let i = 0; i < p.length; i++) {
      let r = p[i].split("=");
      matches[decodeURIComponent(r[0])] = decodeURIComponent(
        r.slice(1).join("="),
      );
    }
  }
  let url = toSegments(path.replace(reg, ""));
  let route: string[] = toSegments(subpath || "");
  let max = Math.max(url.length, route.length);
  for (let i = 0; i < max; i++) {
    if (route[i] && route[i].charAt(0) === ":") {
      let param = route[i].replace(/(^:|[+*?]+$)/g, ""),
        //@ts-ignore
        flags = (route[i].match(/[+*?]+$/) || EMPTY)[0] || "",
        plus = ~flags.indexOf("+"),
        star = ~flags.indexOf("*"),
        val = url[i] || "";
      if (!val && !star && (flags.indexOf("?") < 0 || plus)) {
        ret = false;
        break;
      }
      matches[param] = decodeURIComponent(val);
      if (plus || star) {
        matches[param] = url.slice(i).map(decodeURIComponent).join("/");
        break;
      }
    } else if (route[i] !== url[i]) {
      ret = false;
      break;
    }
  }
  if (opts.default !== true && ret === false) return false;
  return matches;
}

export function pathRankSort(a: any, b: any) {
  return a.rank < b.rank ? 1 : a.rank > b.rank ? -1 : a.index - b.index;
}

// filter out VNodes without attributes (which are unrankeable), and add `index`/`rank` properties to be used in sorting.
export function prepareVNodeForRanking(vnode: any, index: number) {
  vnode.index = index;
  vnode.rank = rankChild(vnode);
  return vnode.props;
}

export function toSegments(url: string) {
  return url.replace(/(^\/+|\/+$)/g, "").split("/");
}

export function rankSegment(segment: string) {
  return segment.charAt(0) == ":"
    ? 1 + "*+?".indexOf(segment.charAt(segment.length - 1)) || 4
    : 5;
}

export function rank(path: string) {
  return toSegments(path).map(rankSegment).join("");
}

function rankChild(vnode: any) {
  return vnode.props.default ? 0 : rank(vnode.props.path);
}

export function changeLocation(
  prevState: RouteLocation,
  action: RouteLocation,
): RouteLocation {
  const result = { ...prevState, ...action };
  if (shallowEqual(result, prevState)) {
    return prevState;
  }
  if (shallowEqual(result, action)) {
    return action;
  }
  return result;
}

export enum ActionType {
  UPDATE,
  CAN_UPDATE,
  GET_CURRENT,
}

type RefObject<T> = {
    current: T
}

type ActionTypes =
  | {
      type: ActionType.UPDATE;
      payload: RouteLocation;
    }
  | {
      type: ActionType.CAN_UPDATE;
      payload: {
        state: RouteLocation;
        callback: (can: boolean, current: RouteLocation) => void;
      };
    }
  | {
      type: ActionType.GET_CURRENT;
      payload: (current: RouteLocation) => void;
    };

const locationReducer = (prevState: RouteLocation, action: ActionTypes) => {
  switch (action.type) {
    case ActionType.UPDATE:
      return changeLocation(prevState, action.payload);
    case ActionType.CAN_UPDATE:
      action.payload.callback( shallowEqual(prevState, action.payload.state), prevState);
      return prevState;

    case ActionType.GET_CURRENT:
      action.payload(prevState);
      return prevState;
  }
};

export function useLocationReducer(props: { url?: string }) {
  return useReducer<Reducer<RouteLocation, ActionTypes>, string>(
    locationReducer,
    props.url ?? location.pathname + location.search,
    (url) => ({
      url,
      path: new URL(url, location.origin).pathname.replace(/\/+$/g, "") || "/",
      query: Object.fromEntries(new URL(url, location.origin).searchParams),
      state: null,
      action: "push",
    }),
  );
}
