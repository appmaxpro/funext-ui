export const routerBus: EventBus;

export type StateRooter = {
  current: Readonly<any>;
  stateToUrl: (state: { [key: string]: any }) => string;
  urlToState: (urlObj: any) => any;
  pushState: (state: object, options?: object) => void;
};


export const router:StateRooter ;

export function startRouter();