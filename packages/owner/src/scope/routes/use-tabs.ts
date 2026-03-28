import { isEqual, isNil, noop, omit, omitBy, pick } from "lodash";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create, type StoreApi } from "zustand";

import { useLazyRef } from "@funext/ui";
import { useNavigate } from "react-router";
import { useResourceContext } from "~/context";
import { dialogs } from "~/hooks/use-dialogs";
import {
  deepClone,
  EMPTY_ARRAY,
  EMPTY_RECORD,
  getResource,
  i18n,
  removeEmpty,
  type FilterViewBlock,
  type FormView,
  type Resource,
  type ResourceView,
  type ViewBlock,
} from "~/utils";
import { device } from "~/utils/device";
import { session } from "~/utils/session";
import { nullResourceView, processViewBlock } from "../block/block-processor";
import type {
  PartTabState,
  Tab,
  TabListener,
  TabOptions,
  TabProps,
  TabRoute,
  TabState,
  ViewStore,
} from "../types";
import { getRouteMode } from "../utils";

let rootStore: ViewStore;

class TabObject implements Tab {
  #listeners = new Set<TabListener>();
  _state!: TabState;
  id!: string;
  title!: string;
  action!: Resource;
  popup?: boolean | undefined;
  dashlet?: boolean | undefined;
  popupOptions?: Tab["popupOptions"];
  _counter: number = 0;
  constructor(tab: Omit<Tab, "subscribe">) {
    Object.assign(this, omit(tab, "subscribe", "state", "getState"));
    this._state = tab.state;
    this.subscribe = this.subscribe.bind(this);
    this.getState = this.getState.bind(this);
    this.goPrev = this.goPrev.bind(this);
    this.update(tab.state);
  }

  getState() {
    return this.state;
  }

  get state() {
    return this._state;
  }

  subscribe(listener: TabListener) {
    this.#listeners.add(listener);
    setTimeout(() => this.emit(), 20);
    return () => this.#listeners.delete(listener);
  }

  goPrev() {
    const prevType = this.state.prevType;
    const prevRoute = prevType ? this.state.routes?.[prevType] : undefined;
    prevType
      ? rootStore.updateState(this.id, { route: {...prevRoute, replace: true} }, prevType)
      : closeTab_internal(this.id);
  }

  update(state: TabState) {
    if (!state.type) throw new Error("Update state with invalid/empty type");
    this._state = state;
    if (
      state.routes?.[state.type]?.action &&
      typeof state.routes?.[state.type]?.action !== "string"
    )
      throw new Error("Invalid tab route action");

    if ("route" in state) {
      throw new Error("Invalid tab state 'route' key");
    }

    this.emit();
  }

  emit() {
    this._counter++;
    const lastCounter = this._counter;
    const visible = this._state.visible !== false;
    const listen = (fn: () => void) => {
      if (lastCounter === this._counter) visible ? startTransition(fn) : fn();
    };

    let fn;
    for (const listener of this.#listeners) {
      const lastFn = fn;
      fn = () =>
        listen(() => {
          lastFn?.();
          listener(this._state);
        });
    }
    console.log("TabObject emit counter:", this._counter);
    fn && fn();
  }
}
//type SetViewStore = ((store: ViewStore) => ViewStore);

const viewName = (view: Resource | string) =>
  typeof view === "string" ? view : view.name;

const getViewMode = (type?: string, id?: string, mode?: string) => {
  if (mode && (type === "form" || type?.startsWith("form"))) {
    return mode === "edit" || mode === "new" ? ["form", mode] : ["form"];
  }
  if (!type && id) {
    return ["form", "show"];
  }
  if (!type && (mode === "form" || mode === "list" || mode === "table")) {
    return [mode];
  }

  return type ? [type] : ["list"];
};

const getViewType = (mode?: string) => {
  if (mode === "show") return "form";
  if (mode === "edit") return "form-edit";
  if (mode === "new") return "form-new";
  return mode;
};

const getDefaultViewType = (action: Resource) => {
  const type = action.viewType;
  const isPopup = !!action.params?.["popup"];
  if (isPopup) return type!;
  // on mobile try to use cards view by default
  if (
    type === "table" &&
    device.isMobile &&
    action.views.some((x) => x.type === "list")
  ) {
    return "list";
  }
  if (!type || !action.views.some((x) => x.type === type)) {
    if (action.views.some((x) => x.type === "list")) {
      return "list";
    }
    return action.views[0]?.type ?? "none";
  }
  return type;
};

function adjustRoute(route: TabRoute, type: string) {
  const { id, mode, ...rest } = route;
  if (type === "form") {
    if (!id) return { mode: "new", id, ...rest };
    if (mode === "edit") route;
    return { id, ...rest };
  }
  return rest;
}

const isFormViewType = (type: string) => type.startsWith("form");

function updateTabStateView(
  action: Resource,
  state: Partial<TabState>,
  type: string,
  mode?: string,
) {
  let view: ResourceView | undefined = state.view;
  if (
    !state.view ||
    state.view.type !== type ||
    (type === "form" && state.mode !== mode)
  ) {
    view = getResourceView(action, { name: state.name, type, mode });
    if (!state.view || (view && state.block?.schema !== view)) {
      view ??= nullResourceView; // processViewBlock(view, action.evalContext)
    }
  }
  let block: ViewBlock | undefined = state.block;
  if (view && block?.schema !== view) {
    block = processViewBlock(view, action.evalContext);
  }
  if (block !== state.block || view !== state.view) {
    const { type: prevType, mode: prevMode } = state;
    const newState = {
      ...state,
      block,
      view,
      //...omitBy({ prevType, prevMode, type: type ?? view?.type, mode }, isNil),
    } as TabState;
    return newState;
  }

  if (!state.type && state.view) {
    return { ...state, type: state.view.type } as TabState;
  }
  return state as TabState;
}
/**
 * This function updates tab state of a specific view type.
 *
 * The target view type will be determined by the `options.type` or
 * `route.mode` or `state.type`.
 *
 * @param action the action name
 * @param state the `tab.state` to update
 * @param options the options for the view type
 * @returns updated `state`
 */
const updateTabState = (
  action: Resource,
  state: Partial<TabState>,
  options: {
    type?: string;
    mode?: string;
    route?: Partial<TabRoute>;
    props?: Record<string, any>;
    force?: boolean;
  },
): TabState => {
  const { route, props, force } = options;

  //const type = options.type ?? route?.mode ?? state.type ?? 'list';
  /*
    getViewType(
      options.mode ?? route?.mode
    ) ?? options.type ?? state.type ?? 'list';*/

  const {
    type,
    mode,
    id: newId,
  } = getRouteMode(
    options.type,
    route?.mode,
    route?.id,
    !force ? { type: state.type, mode: state.mode } : undefined,
  );

  console.log("Try updateTabState: route:", route, ", ", {
    type,
    mode,
    id: newId,
  });

  const { id = newId, qs = EMPTY_RECORD } =
    route ?? state.routes?.[type] ?? EMPTY_RECORD;

  const prevRoute = omit(omitBy(state.routes?.[type], isNil), 'replace') as TabRoute;

  const nextRoute = adjustRoute(
    omitBy({ action: action.name, mode, id, qs }, isNil) as TabRoute,
    type,
  );

  const typeProps = state.props?.[type];

  const prevProps =
    props && props !== typeProps ? omitBy(typeProps ?? {}, isNil) : typeProps;
  const nextProps =
    props && props !== typeProps
      ? omitBy({ ...prevProps, ...props }, isNil)
      : prevProps;

  state = updateTabStateView(action, state, type, mode) as TabState;

  const routeSame = isEqual(prevRoute, nextRoute);
  const propsSame =
    (typeProps && prevProps === nextProps) || isEqual(prevProps, nextProps);

  if (
    routeSame &&
    propsSame &&
    type === state.type &&
    state.type &&
    mode === state.mode
  ) {
    console.log("updateTabState: no change");
    return state as TabState;
  }

  const prevType = type !== state.type ? state.type : state.prevType;
  const prevMode = mode !== state.mode ? state.mode : state.prevMode;

  const newState = { ...state, type, mode, prevType, prevMode };

  if (!routeSame) {
    if(route && route.replace)
      nextRoute.replace = true;
    
    newState.routes = { ...newState.routes, [type]: nextRoute };
  }
  if (!propsSame)
    newState.props = { ...newState.props, [type]: nextProps ?? {} };

  console.log("updateTabState: update:", {
    prevType,
    prevMode,
    routeSame,
    propsSame,
  });

  return newState as TabState;
};

export async function loadResource(view: string, options?: TabOptions) {
  const type = options?.type;
  let { loader, ...params } = removeEmpty({ ...options?.params }) as any;
  const context = removeEmpty({ ...options?.context });
  let loadOptions = { params: { ...params, type }, loader, context };
  if (options?.custom && !loader) {
    loadOptions.loader = {
      type: "json",
      load: (name: string): Partial<Resource> => {
        return {
          name,
          views: [
            {
              type: "custom",
              render: () => null,
            },
          ],
          fields: [],
          context: {},
        } as unknown as Resource;
      },
    };
  }

  return await getResource(view, loadOptions);
}

function getResourceView(
  action: Resource,
  {
    name,
    type: viewType,
    mode,
  }: { name?: string; type?: string; mode?: string },
) {
  if (name || !action.views.length) {
    return action.views.find((v) => v.name === name);
  }

  const isPopup = !!action.params?.["popup"];
  if (isPopup) {
    const view = action.views.find((v) => v.name === action.viewType);
    if (view || !!action.viewType || !action.views.length) return view;
    return action.views[0];
  }

  const type = viewType;
  // on mobile try to use cards view by default
  if (
    viewType === "grid" &&
    device.isMobile &&
    action.views.some((x) => x.type === "list")
  ) {
    return action.views.find((v) => v.type === "list");
  }

  if ((mode || type === "form") && (!type || type === "form")) {
    const forms = action.views.filter((v) => "form");
    let view = forms.find((v) => (v as FormView).mode === mode);
    if (view) return view;
    if (type === "form" && forms.length) {
      return forms[0];
    }
  }

  if (type && action.views.some((x) => x.type === type)) {
    return action.views.find((x) => x.type === type);
  }
  if (!type) {
    let viewList = action.views.find((v) => v.type === "list");
    let viewGrid = action.views.find((v) => v.type === "grid");
    let firstView = action.views[0];
    return (
      (device.isMobile ? (viewList ?? viewGrid) : (viewGrid ?? viewList)) ??
      firstView
    );
  }

  //return null;
}

/**
 * Initialize a view tab for the given action-view.
 *
 * @param view the action-view or name
 * @param options additional options for a view type
 * @returns a Tab or null if unable to find the action-view
 */
export async function initTab(
  view: Resource | string,
  options?: TabOptions,
  viewStore: ViewStore = rootStore,
) {
  const {
    route: initRoute,
    props,
    tab: initAsTab,
    onGridSearch,
    mode: inMode,
    params,
    custom,
  } = options ?? {};

  const actionName = viewName(view);
  const actionView =
    typeof view === "object" && view.views?.length
      ? view
      : await loadResource(actionName, options);

  if (actionView) {
    const { name: id, title = "", context, params } = actionView;
    let view = actionView.params?.view ?? params?.view;
    let openSide = actionView.params?.side;
    let mode = initRoute?.mode;
    let type = options?.type;

    let name = typeof view === "string" ? view : undefined;
    if (!view) {
      type = getViewType(type ?? getDefaultViewType(actionView) ?? "")!;
      let openSide = actionView.params?.side;

      const [mainType, mainMode] = type.split("-");

      mode =
        inMode ??
        (context?._showRecord
          ? context?._showRecord.id
            ? "edit"
            : "new"
          : mainType === "form"
            ? (mainMode ?? "show")
            : undefined);
    }

    view = typeof view === "object" ? view : undefined;

    const route =
      (view?.type ?? type) === "form"
        ? {
            action: actionView.name,
            ...initRoute,
            mode: view?.mode ?? mode,
            id: context?._showRecord?.id || initRoute?.id,
          }
        : {
            action: actionView.name,
            ...initRoute,
          };

    const initState = updateTabState(
      actionView,
      { type: view?.type ?? type, view, title, ...(name && { name }) },
      { route, props },
    );
    console.log("Open tab:", { route, initState });
    const state = { ...initState } as TabState;

    const popup = !initAsTab && Boolean(actionView.params?.popup ?? openSide);
    const showToolbar = actionView.params?.["show-toolbar"] !== false;
    const hasToolAttr =
      !popup &&
      actionView.params &&
      Reflect.has(actionView.params, "show-toolbar");

    const popupOptions = popup
      ? {
          fullScreen: Boolean(actionView.params?.["popup.maximized"]),
          showToolbar,
          showEditIcon: actionView.params?.["_popup-edit-icon"] !== false,
          multiSelect: actionView.params?.["_popup-multi-select"] !== false,
          side: openSide,
          onGridSearch,
        }
      : hasToolAttr
        ? {
            showToolbar,
          }
        : undefined;

    const filter = actionView.filter
      ? (processViewBlock(
          actionView.filter,
          actionView.evalContext,
        ) as FilterViewBlock)
      : undefined;
    const tab: Tab = {
      id,
      title,
      action: actionView,
      state: state,
      popup,
      popupOptions,
      filter,
      custom,
      subscribe: noop as Tab["subscribe"],
      getState() {
        return state;
      },
    };

    return tab;
  }

  return null;
}

function isSingleTab() {
  const info = session.info;
  return device.isMobile /*(
    device.isMobile ||
    info?.view?.singleTab ||
    info?.user?.singleTab ||
    info?.view?.maxTabs === 0 ||
    info?.view?.maxTabs === 1
  )*/;
}

type GetViewStore = () => ViewStore;

export const useViewStore = create<ViewStore>((set, get) => ({
  pages: [],
  popups: [],
  current: undefined,
  get active() {
    let store = get();
    return store.current?.id ?? store.pages[0]?.id ?? "";
  },
  find(tabId: string) {
    const { pages, popups } = get();
    let found = popups.find((item) => item.id === tabId);
    if (found) return found;
    return pages.find((item) => item.id === tabId);
  },
  setState(tabId: string, state) {
    set((store) => {
      let found = store.find(tabId);
      if (found) {
        const prev = found.state;
        const next = typeof state === "function" ? state(prev) : state;
        if (prev === next) {
          return store;
        }
        const type = next?.type ?? prev.type;
        const route = next?.routes?.[type] ?? prev.routes?.[type];
        const props = next?.props?.[type] ?? prev.props?.[type];
        /*
        if (type && type === prev.type) {
          setTimeout(() =>
            store.updateState(tabId, { ...state, route, props, type }),
          );
          return store;
        }*/

        const newSate = updateTabState(
          found.action,
          { ...prev, ...next },
          { route, props, type },
        );

        if (newSate === prev) {
          return store;
        }

        if (found instanceof TabObject) {
          found.update(newSate);
          return store;
        }
        const { pages, popups } = store;
        const updatedTab = { ...found, state: newSate };
        if (pages.includes(found)) {
          const pos = pages.indexOf(found);
          const newPages = [...pages];
          newPages[pos] = updatedTab;
          return { ...store, pages: newPages };
        }
        const pos = popups.indexOf(found);
        const newPopups = [...popups];
        newPopups[pos] = updatedTab;
        return { ...store, popups: newPopups };
      }
      return store;
    });
  },
  updateState(tabId: string, state, type) {
    //if (isEmpty(omitBy(state, isNil))) return;
    set((store) => {
      let found = store.find(tabId);
      if (found) {
        let prev = found.state;
        type ??= state.type;
        const changeType = type !== prev.type || true;
        //console.log("Try change state:", prev.type);
        if (changeType || !prev.type) {
          const nex = updateTabState(found.action, prev, { ...state, type });

          (found as TabObject).update(nex);
          return store;
        }
        type ??= state.type ?? prev.type;
        let routeSame = true;
        let propsSame = true;
        let otherSame = true;
        let prevRoute;
        let nextRoute;
        let prevProps;
        let nextProps;
        if (state.route) {
          const { id = "", qs = EMPTY_RECORD } = state.route;
          prevRoute = pick(prev.routes?.[type], "id", "qs");
          nextRoute = { id, qs } as TabRoute;
          routeSame = isEqual(prevRoute, nextRoute);
          prevRoute = prev.routes?.[type];
        }
        if (state.props) {
          prevProps = prev.props?.[type] ?? EMPTY_RECORD;

          nextProps = { ...prevProps, ...state.props };
          propsSame = isEqual(prevProps, nextProps);
        }

        const otherNext = {} as any;
        ["dirty", "visible", "title", "name"]
          .filter((key) => state.hasOwnProperty(key))
          .forEach(
            (key) => (otherNext[key] = state[key as keyof typeof state]),
          );

        if (Object.keys(otherNext).length) {
          const otherPrev = pick(prev, ...Object.keys(otherNext));

          otherSame = isEqual(otherPrev, otherNext);
        }

        if (!routeSame || !propsSame || !otherSame) {
          let newState = {
            ...prev,
            ...otherNext,
            ...(!routeSame && {
              routes: {
                ...prev.routes,
                [type]: { ...prevRoute, ...nextRoute },
              },
            }),
            ...(!propsSame && { props: { ...prev.props, [type]: nextProps! } }),
          }; //{ ...prev, ...otherNext };

          (found as TabObject).update(newState);
        }
      }
      return store;
    });
  },
  setTabProps(tabId: string, props: TabProps, type?: string) {
    let found = get().find(tabId);
    if (found) {
      type ??= found.state.type;
      const prevProps = found.state.props?.[type] ?? EMPTY_RECORD;
      const nextProps = { ...prevProps, ...props } as TabProps;
      if (!isEqual(prevProps, nextProps)) {
        const newState = {
          ...found.state,
          props: { ...found.state.props, [type]: nextProps },
        };
        (found as TabObject).update(newState);
      }
    }
  },
  async openTab(view, options) {
    return openTabAtom(get, set, view, options);
  },
  closeTab: (view) => closeTabAtom(set, view),
}));

const openTabAtom = async (
  get: GetViewStore,
  set: StoreApi<ViewStore>["setState"],
  view: Resource | string,
  options: TabOptions = EMPTY_RECORD,
): Promise<Tab | null> => {
  const name = viewName(view);
  /*
  const hash = window.location.hash;

  if (hash && hash !== "#/" && !hash.startsWith("#/ds/")) {
    window.location.hash = "";
  }
    */

  // special case of relational field popups
  if (name.startsWith("$selector")) {
    return name === view ? null : await initTab(view, options);
  }

  const store = get();
  const { active, pages: tabs, popups } = store;
  const singleTab = isSingleTab();
  const activeTab = tabs.find((x) => x.id === active);

  const found =
    tabs.find((x) => x.id === name) ?? popups.find((x) => x.id === name);

  if (found) {
    //if (options)
    store.updateState(
      name,
      pick(
        options,
        "type",
        "mode",
        "props",
        "route",
        "force",
      ) as Partial<TabState>,
    );

    if (found.id === active) return null;

    if (tabs.includes(found)) {
      set((prev) => ({ ...prev, current: found }));
    }
    return found;
  }

  if (singleTab && activeTab) {
    // close current one
    const canConfirm = activeTab.action.params?.["show-confirm"] !== false;
    if (canConfirm && activeTab.state.dirty) {
      const closed = await dialogs.confirm(
        i18n.get("The data change confirm leave?"),
        {
          severity: "warning",
        },
      );
      if (!closed) return activeTab;
    }
  }

  const tab = await initTab(view, options);

  if (tab) {
    // html view with target="_blank"
    if (
      tab.action.viewType === "html" &&
      tab.action.params?.target === "_blank"
    ) {
      const html = tab.action.views?.find((x) => x.type === "html") as any;
      const url = html?.name || html?.resource;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }

      return tab;
    }

    let newTab = new TabObject(tab);

    set((state) => {
      const { pages: tabs, popups } = state;
      const found =
        tabs.find((x) => x.id === name) ?? popups.find((x) => x.id === name);
      if (found) {
        newTab = found as TabObject;
        return state;
      }

      const newState = tab.popup
        ? { ...state, pages: tabs, popups: [...popups, newTab] }
        : {
            ...state,
            pages: singleTab ? [newTab] : [...tabs, newTab],
            popups,
            current: newTab,
          };
      return newState;
    });

    return newTab;
  }

  return tab;
};

const closeTabAtom = async (
  set: StoreApi<ViewStore>["setState"],
  view: Resource | string,
) => {
  set((prev) => {
    const { current, pages: tabs, popups } = prev;
    const name = viewName(view);
    const found = tabs.find((x) => x.id === name);
    if (found) {
      let index = tabs.indexOf(found);
      let next = current;

      if (found.id === current?.id) {
        next = tabs[index + 1] ?? tabs[index - 1];
      }

      const newTabs = tabs.filter((x) => x !== found);
      return {
        ...prev,
        current: next,
        pages: newTabs,
      };
    }

    const popup = popups.find((x) => x.id === name);
    if (popup) {
      const newPopups = popups.filter((x) => x.id !== name);
      return {
        ...prev,
        popups: newPopups,
      };
    }

    return prev;
  });
};

/**
 * This hook can be used to handle view tabs/popups.
 *
 * @returns current state of opened views and open/close
 *          methods to open new views or close a view.
 */
export function useTabs() {
  const tabs = useViewStore((state) => state.pages);
  const popups = useViewStore((state) => state.popups);
  const open = useViewStore((state) => state.openTab);
  const close = useViewStore((state) => state.closeTab);

  const active = useViewStore((state) => state.current);
  //const navigate = useNavigate();
  const changeRef = React.useRef(0);
  /*
  useEffect(() => {
    const timeout = setTimeout(() => tabs.length === 0 && navigate("/"), 3000);
    return () => clearTimeout(timeout);
  }, [tabs, navigate]);*/

  return useMemo(
    () => ({
      active,
      items: tabs,
      popups,
      open,
      close,
      change: (changeRef.current += 1),
    }),
    [tabs, active, popups, open, close],
  );
}

export function setRootStore(store: any) {
  rootStore = store;
}

// for internal use only with action handler
export function openTab_internal(
  view: string | Resource,
  options: {
    type?: string;
    route?: Omit<TabRoute, "action">;
    props?: Record<string, any>;
  } = {},
) {
  rootStore.openTab(view, options);
}

// for internal use only with action handler
export function closeTab_internal(view: string | Resource) {
  rootStore.closeTab(view);
}

export function useActiveTab_internal() {
  const active = rootStore.current;
  const update = useViewStore((state) => state.setState);
  const find = useViewStore((state) => state.find);

  const state = active?.state;
  const setState = (state: Partial<TabState>) => {
    const tab = active ? find(active.id) : undefined;
    if (tab) {
      update(tab.id, state);
    }
  };
  return [state, setState] as const;
}

export function useViewTab() {
  const { tab } = useResourceContext();
  return tab;
}

export function useViewState(): [TabState, (state: PartTabState) => void] {
  const tab = useViewTab();
  const storeSetState = useViewStore((state) => state.updateState);
  const [state, setState] = useState(tab.state);
  useEffect(() => {
    return tab.subscribe(() => setState(tab.state));
  });

  const updateState = useCallback(
    (state: PartTabState) => {
      storeSetState(tab.id, state);
    },
    [storeSetState],
  );

  return [state, updateState] as const;
}

export function useGetViewState() {
  return useViewState()[0];
}

export function useViewTypeState(
  type?: string,
): [PartTabState, (state: PartTabState) => void] {
  const tab = useViewTab();

  const storeSetState = useViewStore((state) => state.updateState);
  const tabState = tab.state;
  const [state, setState] = useState<PartTabState>(
    () =>
      ({
        title: tabState.title,
        name: tabState.name,
        visible: tabState.visible,
        dirty: tabState.dirty,
        route: omitBy(tabState.routes?.[type ?? tabState.type], isNil),
        props: omitBy(tabState.props?.[type ?? tabState.type], isNil),
      }) as PartTabState,
  );
  useEffect(() => {
    return tab.subscribe(() => {
      const tabState = tab.state;
      const viewType = type ?? tab.state.type;
      if (tabState.type === viewType) {
        setState((state) => {
          const nextRoute = omitBy(tabState.routes?.[viewType], isNil);
          const nextProps = omitBy(tabState.props?.[viewType], isNil);

          let change =
            !isEqual(nextRoute, state.route) ||
            !isEqual(nextProps, state.props) ||
            state.dirty !== tabState.dirty ||
            state.visible !== tabState.visible ||
            state.title !== tabState.title;
          if (change) {
            return {
              title: tabState.title,
              name: tabState.name,
              visible: tabState.visible,
              dirty: tabState.dirty,
              route: nextRoute,
              props: nextProps,
            } as PartTabState;
          }
          return state;
        });
      }
    });
  });

  const updateState = useCallback(
    (state: PartTabState) => {
      const viewType = type ?? tab.state.type;
      storeSetState(tab.id, state, viewType);
    },
    [storeSetState, type],
  );

  //const selector = useCallback((k: keyof PartTabState) => state[k], [state]);

  return [state, updateState /*, selector as Selector*/];
}

export function useViewStateValue<K extends keyof PartTabState>(
  k: K,
): [PartTabState[K], (value: any) => void] {
  const tab = useViewTab();
  const [state, setState] = useViewTypeState(tab.state.type);
  return [
    useMemo(() => state[k], [state[k]]),
    useCallback((value: any) => setState({ [k]: value }), [setState]),
  ];
}

export function useGetViewStateValue<K extends keyof PartTabState>(
  k: K,
): PartTabState[K] {
  return useViewStateValue(k)[0];
}

export function useViewDirtyState() {
  return useViewStateValue("dirty");
}

export function useViewSwitch(): (type: string, parts?: PartTabState) => void {
  const tab = useViewTab();
  //const storeUpdate = useViewStore((state) => state.update);
  const storeSetState = useViewStore((state) => state.updateState);

  const setViewType = useCallback(
    (type: string, parts?: PartTabState): void => {
      storeSetState(tab.id, { type, ...parts });
    },
    [tab],
  );
  return setViewType;
  //return [block, setViewType];
}

export function useTabRoute(type?: string): TabRoute | undefined {
  const tab = useViewTab();
  //const typeRef = useLazyRef(() => type);
  const cp = React.useCallback(
    () => tab.state.routes?.[type ?? tab.state.type],
    EMPTY_ARRAY,
  );
  const route = React.useSyncExternalStore(tab.subscribe, cp);

  return route;
}

function useReadPropsType(tab: Tab, type: string) {
  return React.useCallback(() => tab.state.props?.[type], EMPTY_ARRAY);
}

/**
 * This hook can be used to keep track of view specific state in tab.
 *
 */
export function useViewProps(type?: string) {
  const tab = useViewTab();
  const typeRef = useLazyRef(() => type ?? tab.state.type);
  const cp = React.useCallback(
    () => tab.state.props?.[typeRef.current],
    EMPTY_ARRAY,
  );
  const setTabProps = useViewStore((state) => state.setTabProps);
  const props = React.useSyncExternalStore(tab.subscribe, cp);

  const setProps = useCallback(
    (props: TabProps) => {
      setTabProps(tab.id, props, typeRef.current);
    },
    [setTabProps],
  );

  return [props, setProps] as const;
}

/**
 * This hook can be used to keep track of particular view specific state prop in tab.
 *
 */
export function useViewProp<K extends keyof TabProps>(propName: K) {
  const [props, setProps] = useViewProps();

  const setProp = useCallback(
    (value: TabProps[K]) => {
      setProps({ [propName]: value });
    },
    [setProps],
  );

  return useMemo(() => [props?.[propName], setProp] as const, [props]);
}
