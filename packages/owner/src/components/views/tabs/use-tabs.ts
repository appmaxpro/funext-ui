import { isEmpty, isEqual, isNil, noop, omit, omitBy, pick } from "lodash";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type SetStateAction,
  useSyncExternalStore,
} from "react";
import { create, useStore, type StoreApi } from "zustand";

import {
  EMPTY_RECORD,
  getResource,
  i18n,
  removeEmpty,
  type DataRecord,
  type DataStore,
  type FilterViewBlock,
  type FormView,
  type Resource,
  type ResourceView,
  type SavedFilter,
  type SearchPage,
  type ViewBlock,
} from "~/utils";
import { device } from "~/utils/device";
import { session } from "~/utils/session";
import { useNavigate } from "react-router";
import type { ListParams } from "../list-types";
import { dialogs } from "~/hooks/use-dialogs";
import { nullResourceView, processViewBlock } from "../block-handler";
import { useResourceContext } from "~/context";
import type {
  PartTabState,
  Tab,
  TabListener,
  TabProps,
  TabRoute,
  TabState,
  ViewStore,
} from "../types";
import { useLazyRef } from "@funext/ui";

type TabOptions = {
  type?: string;
  route?: Omit<TabRoute, "action">;
  props?: Record<string, any>;
  params?: Record<string, any>;
  context?: any;
  mode?: string;
  tab?: boolean;
  view?: string;
  onGridSearch?: (
    records: DataRecord[],
    page: SearchPage,
    search?: Record<string, string>,
  ) => DataRecord[];
};

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
    omit(tab, "subscribe", "state");
    Object.assign(this, omit(tab, "subscribe", "state"));
    this._state = tab.state;
  }

  get state() {
    return this._state;
  }

  subscribe(listener: TabListener) {
    this.#listeners.add(listener);
    setTimeout(()=> this.emit(), 20);
    return () => this.#listeners.delete(listener);
  }

  update(state: TabState) {
    this._state = state;
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

    fn && fn();
  }
}
//type SetViewStore = ((store: ViewStore) => ViewStore);

const viewName = (view: Resource | string) =>
  typeof view === "string" ? view : view.name;

const getViewMode = (type: string, mode?: string) => {
  if (type === "form" || type.startsWith("form")) return mode ?? "show";
  return type;
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
    type === "list" &&
    device.isMobile &&
    action.views.some((x) => x.type === "cards")
  ) {
    return "cards";
  }
  if (!type || !action.views.some((x) => x.type === type)) {
    if (action.views.some((x) => x.type === "list")) {
      return "list";
    }
    return action.views[0]?.type ?? "none";
  }
  return type;
};

const isFormViewType = (type: string) => type.startsWith("form");

function updateTabStateView(
  action: Resource,
  state: Partial<TabState>,
  type: string,
  mode?: string,
) {
  if (
    !state.view ||
    state.view.type !== type ||
    (type === "form" && state.mode !== mode)
  ) {
    const view = getResourceView(action, { name: state.name, type, mode });
    if (!state.view || (view && state.block?.schema !== view)) {
      state.view = view ?? nullResourceView; // processViewBlock(view, action.evalContext)
    }
  }
  if (state.block?.schema !== state.view) {
    state.block = processViewBlock(state.view, action.evalContext);
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
    route?: Partial<TabRoute>;
    props?: Record<string, any>;
    mode?: string;
  },
): TabState => {
  const { route, props } = options;
  const type =
    getViewType(
      options.mode ?? options.type ?? route?.mode ?? state.mode ?? state.type,
    ) ?? "grid";
  const mode = getViewMode(
    type,
    options.mode ?? route?.mode,
  ) as TabState["mode"];

  const { id = "", qs = EMPTY_RECORD } =
    route ?? state.routes?.[type] ?? EMPTY_RECORD;

  const prevRoute = omitBy(state.routes?.[type], isNil) as TabRoute;
  const nextRoute = omitBy(
    { action: action.name, mode, id, qs },
    isNil,
  ) as TabRoute;

  const prevProps = omitBy(state.props?.[type], isNil);
  const nextProps =
    props == null ? EMPTY_RECORD : omitBy({ ...prevProps, ...props }, isNil);

  state = updateTabStateView(action, state, type, mode);

  const routeSame = isEqual(prevRoute, nextRoute);
  const propsSame = isEqual(prevProps, nextProps);

  if (routeSame && propsSame && type === state.type && mode === state.mode) {
    return state as TabState;
  }

  const prevType = type !== state.type ? state.type : state.prevType;
  const prevMode = mode !== state.mode ? state.mode : state.prevMode;

  const newState = { ...state, type, prevType, prevMode, mode };

  if (!routeSame) newState.routes = { ...newState.routes, [type]: nextRoute };
  if (!propsSame) newState.props = { ...newState.props, [type]: nextProps };

  return newState as TabState;
};

export async function loadResource(view: string, options?: TabOptions) {
  const type = options?.type;
  const params = removeEmpty({ ...options?.params });
  const context = removeEmpty({ ...options?.context });

  return await getResource(view, { params: { ...params, type }, context });
}

function getResourceView(
  action: Resource,
  {
    name,
    type: viewType,
    mode,
  }: { name?: string; type?: string; mode?: string },
) {
  if (name) {
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

  return null;
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
  } = options ?? {};

  const actionName = viewName(view);
  const actionView =
    typeof view === "object" && view.views?.length
      ? view
      : await loadResource(actionName, options);

  if (actionView) {
    const { name: id, title = "", context, params } = actionView;
    let view = actionView.params?.view ?? options?.view;
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
            ...initRoute,
            mode: view?.mode ?? mode,
            id: context?._showRecord?.id || initRoute?.id,
          }
        : initRoute;

    const initState = updateTabState(
      actionView,
      { type: view?.type ?? type, view, title, ...(name && { name }) },
      { route, props },
    );

    const state = Object.create(initState) as TabState;

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
      subscribe: noop as Tab["subscribe"],
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
    return get().current?.id ?? "";
  },
  find(tabId: string) {
    const { pages, popups } = get();
    let found = popups.find((item) => item.id === tabId);
    if (found) return found;
    return pages.find((item) => item.id === tabId);
  },
  update(tabId: string, state) {
    if (typeof state !== "function") {
      state = omitBy(state, isNil);
      if (isEmpty(state)) return;
    }
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
        const newSate = updateTabState(
          found.action,
          { ...prev, ...next },
          { route, props },
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
  setState(tabId: string, state, type) {
    state = omitBy(state, isNil);
    if (isEmpty(state)) return;
    set((store) => {
      let found = store.find(tabId);
      if (found) {
        type ??= found.state.type;
        const changeType = state.type && type !== state.type;
        if (changeType) {
          type = state.type!;
          if (changeType) {
            const prev = found.state;
            const nex = updateTabState(found.action, found.state, state);

            if (prev !== prev) {
              (found as TabObject).update(nex);
            }
            return store;
          }
        }

        let routeSame = true;
        let propsSame = true;
        let otherSame = true;
        let prevRoute;
        let nextRoute;
        let prevProps;
        let nextProps;
        if (state.route) {
          const { id = "", qs = EMPTY_RECORD } = state.route;
          prevRoute = pick(
            omitBy(found.state.routes?.[type], isNil),
            "id",
            "qs",
          );
          nextRoute = { id, qs } as TabRoute;
          routeSame = isEqual(prevRoute, nextRoute);
        }
        if (state.props) {
          prevProps = found.state.props?.[type] ?? EMPTY_RECORD;
          nextProps = { ...prevProps, ...state.props };
          propsSame = isEqual(prevProps, nextProps);
        }
        const otherNext = omitBy(
          pick(state, "dirty", "visible", "title", "name"),
          isNil,
        );
        if (Object.keys(otherNext).length) {
          const otherPrev = omitBy(
            pick(found.state, "dirty", "visible", "title", "name"),
            isNil,
          );
          otherSame = isEqual(otherPrev, otherNext);
        }
        if (!routeSame || !propsSame || !otherSame) {
          const newState = { ...found.state, ...otherNext };

          if (!routeSame) {
            newState.routes = {
              ...newState.routes,
              [type]: { ...prevRoute, ...nextRoute } as TabRoute,
            };
          }

          if (!propsSame) {
            newState.props = { ...newState.props, [type]: nextProps! };
          }

          (found as TabObject).update(newState);
        }
      }
      return store;
    });
  },
  setTabProps(tabId: string, props: TabState["props"], type?: string) {
    let found = get().find(tabId);
    if (found) {
      type ??= found.state.type;
      const prevProps =
        omitBy(found.state.props?.[type], isNil) ?? EMPTY_RECORD;
      const nextProps = { ...prevProps, ...omitBy(props, isNil) } as TabProps;
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
    store.update(name, omit(options, "view") as Partial<TabState>);
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
  const navigate = useNavigate();

  useEffect(() => {
    tabs.length === 0 && navigate("/");
  }, [tabs, navigate]);

  return useMemo(
    () => ({
      active,
      items: tabs,
      popups,
      open,
      close,
    }),
    [tabs, active, popups, open, close],
  );
}

let rootStore: ViewStore;

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
  const update = useViewStore((state) => state.update);
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

function useTabView() {
  const { tab } = useResourceContext();
}

export function useViewState() {
  const { tab } = useResourceContext();
  const storeSetState = useViewStore((state) => state.setState);
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

  return [state, updateState];
}

type PartKey = keyof PartTabState;

type Selector = <K extends keyof PartTabState>(k: K) => PartTabState[K];

export function useViewTypeState(
  type: string,
): [PartTabState, (state: PartTabState) => void] {
  const { tab } = useResourceContext();
  const storeSetState = useViewStore((state) => state.setState);
  const tabState = tab.state;
  const [state, setState] = useState<PartTabState>(
    () =>
      ({
        title: tabState.title,
        name: tabState.name,
        visible: tabState.visible,
        dirty: tabState.dirty,
        route: omitBy(tabState.routes?.[type], isNil),
        props: omitBy(tabState.props?.[type], isNil),
      }) as PartTabState,
  );
  useEffect(() => {
    return tab.subscribe(() => {
      const tabState = tab.state;
      if (tabState.type === type) {
        setState((state) => {
          const nextRoute = omitBy(tabState.routes?.[type], isNil);
          const nextProps = omitBy(tabState.props?.[type], isNil);

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
      storeSetState(tab.id, state, type);
    },
    [storeSetState, type],
  );

  //const selector = useCallback((k: keyof PartTabState) => state[k], [state]);

  return [state, updateState /*, selector as Selector*/];
}

export function useViewStateValue<K extends keyof PartTabState>(
  k: K,
): [PartTabState[K], (value: any) => void] {
  const { tab } = useResourceContext();
  const [state, setState] = useViewTypeState(tab.state.type);
  return [
    useMemo(() => state[k], [state[k]]),
    useCallback((value: any) => setState({ [k]: value }), [setState]),
  ];
}

export function useViewDirtyState() {
  return useViewStateValue("dirty");
}

export function useViewSwitch():
  (type: string, parts?: PartTabState) => void
 {
  const { tab } = useResourceContext();
  //const storeUpdate = useViewStore((state) => state.update);
  const storeSetState = useViewStore((state) => state.setState);
  const [type, setType] = useState(() => tab.state.type);
  
  //useSyncExternalStore(tab.subscribe, useCallback(()=> ()=>tab.state.type, [] )
  useEffect(() => {
    return tab.subscribe(() => {
      const tabState = tab.state;
      setType(tabState.type);
    });
  }, [tab]);

 // const block = useMemo<ViewBlock>(() => tab.state.block, [type, tab]);

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
  const { tab } = useResourceContext();
  const routeRef = useLazyRef(()=> tab.state.routes?.[type ?? tab.state.type])
  useEffect(() => {
    let currentType = tab.state.type
    return tab.subscribe(() => {
      const tabState = tab.state;
      if((type && tab.state.type === type) || (!type && currentType !== tab.state.type)) {
         currentType = tab.state.type;
         routeRef.current = tabState.routes?.[currentType]
      }
    });
  }, [tab, type]);
  
  return routeRef.current;
}
