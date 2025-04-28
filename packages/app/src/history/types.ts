import { type ComponentType } from "react";
import {
  type BrowserHistory,
  type HashHistory,
  type History,
  type MemoryHistory,
} from "history";
import { Router, type RouterState } from "../router";

export interface RouterStateEvent {
  type: "state";
  data: RouterState;
  isNotFound: boolean;
  state?: any;
}

export interface RouterIntentEvent {
  type: "intent";
  intent: { name: string; params: Record<string, unknown> };
  isNotFound: boolean;
  state?: any;
}

export type RouterEvent = RouterStateEvent | RouterIntentEvent;

/**
 * A subset of the History API is used, and explicitly declared so it's possible to write a custom
 * history implementation that can be used to integrate the router in a variety of parent routers.
 * @internal
 */
export type RequiredHistory = Pick<
  History,
  "listen" | "location" | "push" | "replace"
>;

/**
 * The history context is either one of the implementations from the `history` package, or a custom one that only implements
 * the subset of the History API that is used by the router, documented in `RequiredHistory`.
 * @internal
 */
export type RouterHistory =
  | BrowserHistory
  | MemoryHistory
  | HashHistory
  | RequiredHistory;

/**
 * A tool can be thought of as a top-level "view" or "app".
 * They are available through the global menu bar, and has a URL route associated with them.
 *
 * In essence, a tool is a React component that is rendered when the tool is active,
 * along with a title, name (URL segment) and icon.
 *
 * Tools can handle {@link structure.Intent | intents} such as "edit" or "create" by defining a
 * function for the `canHandleIntent` property, as well as the `getIntentState` property,
 * which defines what an intent will be mapped to in terms of the tool's URL state.
 *
 * @public
 */
export interface Tool<Options = any> {
  /**
   * The React component that renders the tool.
   */
  component: ComponentType<{ tool: Tool<Options> }>;

  /**
   * React component for the icon representing the tool.
   */
  icon?: ComponentType;

  /**
   * The name of the tool, used as part of the URL.
   */
  name: string;

  /**
   * Options are passed through from the configuration to the component defined by the `component`
   */
  options?: Options;

  /**
   * The router for the tool. See {@link router.Router}
   */
  router?: Router;

  /**
   * Title of the tool - used for the navigation menu item, along with the icon.
   */
  title: string;

  /**
   * Determines whether the tool will control the `document.title`.
   */
  controlsDocumentTitle?: boolean;

  /**
   * Gets the state for the given intent.
   *
   * @param intent - The intent to get the state for.
   * @param params - The parameters for the intent.
   * @param routerState - The current router state. See {@link router.RouterState}
   * @param payload - The payload for the intent.
   * @returns The state for the intent.
   */
  getIntentState?: (
    intent: string,
    params: Record<string, string>,
    routerState: RouterState | undefined,
    payload: unknown,
  ) => unknown;

  /**
   * Determines whether the tool can handle the given intent.
   *
   * Can either return a boolean, or an object where the keys represent the parameters that
   * can/can not be handled. This will be used to determine whether or not a tool is the best
   * suited to handle an intent. Note that an object of only `false` values (or an empty object)
   * is treated as `true`, so you want to explicitly return `false` if you know the intent cannot
   * fulfill the intent request.
   *
   * @param intent - The intent to check.
   * @param params - The parameters for the intent.
   * @param payload - The payload for the intent.
   * @returns Boolean: whether it can handle the intent. Object: Values representing what specific parameters can be handled.
   */
  canHandleIntent?: (
    intent: string,
    params: Record<string, unknown>,
    payload: unknown,
  ) => boolean | { [key: string]: boolean };
}

/** @public */
export type ComposableOption<TValue, TContext> = (
  prev: TValue,
  context: TContext,
) => TValue;

/**
 * @hidden
 * @beta
 */
export type AsyncComposableOption<TValue, TContext> = (
  prev: TValue,
  context: TContext,
) => Promise<TValue>;

export interface Workspace {
  tools: Tool[];
  basePath: string;
}
