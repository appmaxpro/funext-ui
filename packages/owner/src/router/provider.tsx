import { Component } from "react";
import type { RouteLocation } from "./router";
import type { BlockerFn, RouterLocationValue } from "./types";
import * as React from "react";
import type { Rect } from "maplibre-gl";

interface RouterStateValue extends RouterLocationValue {
  addBlocker: (blocker: BlockerFn, route: RouteLocation) => () => void;
}

//@ts-ignore
const RouterContext = React.createContext<RouterStateValue>(null);



export type Blocker = {
  route: RouteLocation;
  blockerFn: BlockerFn;
};

type Props = RouterLocationValue & {
  current?: boolean;
};

type State = {
  blockers: Set<Blocker>;
  blockerFns: Set<BlockerFn>;
};

class RouterProvider extends Component<Props, State> {
  static contextType = RouterContext;

  state: Readonly<State> = {
    blockers: new Set<Blocker>(),
    blockerFns: new Set<BlockerFn>(),
  };
  
  blockerFns:Set<BlockerFn> = new Set<BlockerFn>()
  blockers: Set<Blocker> = new Set<Blocker>();
  ctx: Partial<RouterStateValue> = {
     
  }
  constructor(props: Props) {
    super(props);
  }

  addBlocker(blockerFn: BlockerFn, route: RouteLocation) {

    if(this.blockerFns.has(blockerFn)){
      return () => {}
    }
    const blocker = {
      blockerFn,
      route
    }
    this.blockerFns.add(blockerFn);
    this.blockers.add(blocker)
   
    return ()=> {
      this.blockers.delete(blocker);
      this.blockerFns.delete(blockerFn);
    }
  }

  render(): React.ReactNode {

    this.ctx.addBlocker = this.addBlocker;

    return <RouterContext.Provider value={this.ctx as RouterStateValue}>
        <div></div>
    </RouterContext.Provider>
  }
}


class RouteProvider extends Component<RouterLocationValue> {
    static contextType = RouterContext;

}

export const useRouterContext = (): RouterLocationValue =>{
  const ctx = React.useContext(RouterContext);
  if(!ctx) {
    throw new Error("RouterContext is not set yet.")
  }
  return ctx;
}
