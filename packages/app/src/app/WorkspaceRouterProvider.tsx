import { escapeRegExp, isEqual } from "lodash";
import {
  type ComponentType,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { type Router, RouterProvider, type RouterState } from "../router";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector.js";

import { ErrorBoundary } from "./ErrorBoundary";

import { type Tool, type Workspace } from "../history";
import {
  createRouter,
  type RouterHistory,
  type RouterStateEvent,
} from "../history";
import {
  decodeUrlState,
  resolveDefaultState,
  resolveIntentState,
} from "../history/helpers";
import { useRouterHistory } from "../history/RouterHistoryContext";

interface WorkspaceRouterProviderProps {
  children: ReactNode;
  LoadingComponent: ComponentType;
  workspace: Workspace;
  ErrorCP?: ComponentType;
}

export function WorkspaceRouterProvider({
  children,
  LoadingComponent,
  workspace,
  ErrorCP
}: WorkspaceRouterProviderProps) {
  const { basePath, tools } = workspace;
  const history = useRouterHistory();
  const router = useMemo(
    () => createRouter({ basePath, tools }),
    [basePath, tools],
  );
  const [state, onNavigate, locationState] = useRouterFromWorkspaceHistory(
    history,
    router,
    tools,
  );

  const handleCatchError = useCallback(({ error }: { error: Error }) => {
    /** catches errors in studio that bubble up, throwing the error */
    throw error;
  }, []);

  // `state` is only null if the Studio is somehow rendering in SSR or using hydrateRoot in combination with `unstable_noAuthBoundary`.
  // Which makes this loading condition extremely rare, most of the time it'll render `RouteProvider` right away.
  if (!state) return <LoadingComponent />;

  return (
    <ErrorBoundary onCatch={handleCatchError} as={ErrorCP}>
      <RouterProvider onNavigate={onNavigate} router={router} routerState={state} state={locationState}>
        {children}
      </RouterProvider>
    </ErrorBoundary>
  );
}

type HandleNavigate = (opts: { path: string; replace?: boolean, state?: any }) => void;

/**
 * @internal
 */
function useRouterFromWorkspaceHistory(
  history: RouterHistory,
  router: Router,
  tools: Tool[],
): [RouterState | null, HandleNavigate, any? ] {
  // React will only re-subscribe if store.subscribe changes identity, so by memoizing the whole store
  // we ensure that if any of the dependencies used by store.selector changes, we'll re-subscribe.
  // If we don't, we risk hot reload seeing stale workspace configs as the user is editing them.
  const store = useMemo(() => {
    const routerBasePath = router.getBasePath();
    // this regex ends with a `(\\/|$)` (forward slash or end) to prevent false
    // matches where the pathname is a false subset of the current pathname.
    const routerBasePathRegex = new RegExp(
      `^${escapeRegExp(routerBasePath)}(\\/|$)`,
      "i",
    );
    const shouldHandle = (pathname: string) =>
      // this is necessary to prevent emissions intended for other workspaces.
      routerBasePath === "/" ? true : routerBasePathRegex.test(pathname);
    return {
      subscribe: (onStoreChange: () => void) => history.listen(onStoreChange),
      getSnapshot: () =>`${history.location.pathname}${history.location.search || ""}`,
      // Always return null for the server snapshot, as we can't know how to resolve intents until after authentication is done, which is browser-only
      getServerSnapshot: () => null,
      selector: (path: string | null) =>
        typeof path === "string" && shouldHandle(path)
          ? decodeUrlState(router, path)
          : null,
    };
  }, [history, router]);

  const event = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
    store.selector,
    isEqual,
  );
  /**
   * As `prevEvent` needs to be referenced in `onNavigate`, it's important to use a React Ref when reading from it.
   * The `onNavigate` callback is the backbone which all the router operations are built upon, implemented in `RouterProvider`.
   * This includes `navigateUrl`, 'mavigate' and 'navigateIntent'. If we didn't use a React Ref, for example maybe use `useState` instead, then this would mean that every time `prevEvent` got a new value
   * it would trigger a React re-render, which would give `onNavigate` a new identity. Which means all components that use `useRouter` would re-render just so that
   * the callback will "see" the latest `preEvent` value. This is a very expensive operation, and we want to avoid it.
   */
  const prevEvent = useRef(event);

  // Handles redirects from the root base path to the default tool, e.g. `/` -> `/structure`
  useEffect(() => {
    if (event?.type === "state" && !event.data?.intent) {
      const defaultData = resolveDefaultState(tools, event.data);
      if (defaultData && defaultData !== event.data) {
        history.replace(router.encode(defaultData), event.state);
      }
    }
  }, [event?.state, event?.type, history, router, tools]);

  // Handles redirects to intents, e.g. `/test/intent/create/template=codeTest;type=codeTest/` -> `/test/content/input-plugin;codeTest;c7e1aa3e-5555-40f5-b0af-c7309df6edcc%2Ctemplate%3DcodeTest`
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const resolvedIntent = maybeResolveIntent(event, router, tools, prevEvent);
    // If resolvedIntent is truthy then we have a redirect to perform. Most of the time it'll be `null`
    if (resolvedIntent) {
      const {state} = event || {};
      // console.debug('useEffect about to resolve intent URL to %o', resolvedIntent)
      history.replace(resolvedIntent, state);
    } else {
      // console.debug('Syncing prevEvent.current to %o', event)
      /**
       * Sync the prevEvent ref with the current event, in a way that ensures the above side-effect is idemptotent.
       * Idempotent means that if this hook is called multiple times, before the `history` state updates with the result of calling `history.replace` above,
       * then the `prevEvent` ref remains the same until the `history` state has updated.
       */
      prevEvent.current = event;
    }
  }, [event, history, router, tools]);

  const handleNavigate = useMemo<HandleNavigate>(() => {
    // This is using useMemo instead of useCallback just so we can track if it's called an abnormal amount of times
    // console.debug('handleNavigate useMemo called (should optimally only happen once)')
    // console.count('handleNavigate')
    return ({ path, replace, state }) => {
      // Handle intent resolving early, so we avoid rendering intermediate states in the workspace root, as it otherwise resolves intents in useEffect handlers
      const predictedEvent = store.selector(path);
      const resolvedIntent = maybeResolveIntent(
        predictedEvent,
        router,
        tools,
        prevEvent,
      );
      const resolvedPath =
        typeof resolvedIntent === "string" ? resolvedIntent : path;

      if (replace) {
        history.replace(resolvedPath, state);
      } else {
        history.push(resolvedPath, state);
      }
      
    };
  }, [history, router, store, tools]);

  return [event?.data ?? null, handleNavigate, event?.state];
}

// Handles intent resolving, both on navigate events (onClick and such), as well as onLoad by useEffect
function maybeResolveIntent(
  event: RouterStateEvent | null,
  router: Router,
  tools: Tool[],
  prevEvent: MutableRefObject<RouterStateEvent | null>,
): string | null {
  if (event?.type === "state" && event.state?.intent) {
    const redirectState = resolveIntentState(
      tools,
      prevEvent.current?.type === "state" ? prevEvent.current.state : {},
      event.state,
    );

    if (redirectState?.type === "state") {
      return router.encode(redirectState.state);
    }
  }

  return null;
}
