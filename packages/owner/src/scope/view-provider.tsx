import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  isRecordProps,
  type Container,
  type DataContext,
  type DataStore,
  type Domains,
  type FilterView,
  type FormView,
  type FormViewBlock,
  type ListViewBlock,
  type Property,
  type Schema,
  type SearchOptions,
  type ViewBlock,
} from "~/utils";
import type {
  ListModifiers,
  ListParams,
  Ref,
  Tab,
  TabProps,
  ViewProps,
} from "./types";
import React from "react";
import { useFloatingContext, useLazyRef } from "~/ui";
import { useResourceContext, useViewContext, ViewContext } from "~/context";
import { useViewProps } from "./routes";
import {
  buildDomain,
  type FilterTabs,
  type FilterWidget,
} from "~/utils/filter";
import { LinkedList } from "~/utils/linked-list";
import isEqual from "lodash/isEqual";
import { useListParams } from "./utils";
import { Loader } from "~/components";

type Props = {
  value: {
    view: ViewBlock;
    dataStore?: DataStore;
    evalContext?: DataContext;
    context?: DataContext;
    fields?: Property[];
    query?: ListParams;
    modifiers?: ListModifiers;
    filterTabs?: FilterTabs;
    filterSidebar?: Container<FilterWidget>;
    filterForm?: FormView;
  };
  children: React.ReactNode;
};

type ActionRef = {
  getContext?(): DataContext;
  readonly context?: DataContext;
  readonly evalContext?: DataContext;
  readonly fields?: Property[];
};

type SaveState = (props: TabProps, save?: boolean) => void;

export function ViewProvider({ children, value }: Props) {
  const [props, setProps] = useViewProps();
  const { dataStore, tab } = useResourceContext();
  const {
    view: { sType, schema },
  } = value;

  const originContext = React.useMemo(
    () => ({
      evalContext: tab.action.evalContext as DataContext,
      context: tab.action.context,
      fields: tab.action.fields,
    }),
    [tab.action],
  );

  const linkedRef = React.useMemo(() => new LinkedList<any>(), EMPTY_ARRAY);

  const basicRef = useLazyRef(() => {
    //originContext.fields
    //schema.fields 
    return {
      evalContext: tab.action.evalContext as DataContext,
      context: tab.action.context,
      fields: tab.action.fields,
      search: dataStore?.search?.bind(dataStore),
      doSearch: dataStore?.search?.bind(dataStore),
      getContext() {
        return tab.action.context;
      },
    };
  });

  const bind = React.useCallback(
    (bindRef: ActionRef) => {
      if (!linkedRef.head) {
        linkedRef.append(basicRef.current);
      }
      const obj = {
        ...basicRef.current,
        ...bindRef,
      };
      basicRef.current = obj;
      linkedRef.append(obj);
      return () => {
        linkedRef.delete(obj);
        basicRef.current = linkedRef.head;
      };
    },
    [linkedRef],
  );

  const propsRef = useLazyRef(() => props);
  const stateRef = useLazyRef(() => ({}) as any);
  const saveStatesRef = useLazyRef<Set<SaveState>>(() => new Set());

  const saveState = React.useCallback(
    (props: TabProps) => {
      saveStatesRef.current.forEach((fn) => fn(props, true));
    },
    [value],
  );

  const restoreState = React.useCallback(
    (props: TabProps) => {
      saveStatesRef.current.forEach((fn) => fn(props, false));
    },
    [value],
  );

  const addSaveState = React.useCallback((saveState: SaveState) => {
    saveStatesRef.current.add(saveState);
    setTimeout(() => saveState(tab.state), 0);
    return () => saveStatesRef.current.delete(saveState);
  }, []);

  React.useEffect(() => {
    if (!props?.actions || props.actions.saveState !== saveState) {
      setProps({
        actions: {
          state: stateRef.current,
          saveState,
          restoreState,
        },
      });
    } else {
      propsRef.current = props;
    }
  }, [props]);

  const newValue = React.useMemo(() => {
    const newValue = {
      ...value,
      bind,
      setProps,
      addSaveState,
      doSearch: basicRef.current.doSearch,
      dataStore,
      originContext,
      getProps() {
        return propsRef.current;
      },
      get fields() {
        return basicRef.current.fields;
      },
      get evalContext() {
        return basicRef.current.evalContext;
      },
      get context() {
        return basicRef.current.context;
      },
      getContext() {
        return basicRef.current.getContext();
      },
      search(option?: SearchOptions | undefined) {
        return basicRef.current.search?.(option ?? EMPTY_OBJECT);
      },
    };
    console.log("ViewContext:: basicRef:", basicRef.current);
    return newValue;
  }, [value, bind, setProps, addSaveState, dataStore, originContext]);

  return sType === "list" ? (
    <ListViewProvider tab={tab} value={newValue as any}>
      {children}
    </ListViewProvider>
  ) : (
    <ViewContext.Provider value={newValue}>{children}</ViewContext.Provider>
  );
}

const ListViewProvider = ({
  tab,
  children,
  value: valueProp,
}: {
  tab: Tab;
  children: React.ReactNode;
  value: Partial<ViewProps<ListViewBlock>>;
}) => {
  const resource = tab.action;
  const dataStore = valueProp.dataStore!;
  const valueRef = React.useRef(valueProp);
  valueRef.current = valueProp;

  const popup = !!useFloatingContext() || !!tab.dashlet || !!tab.popup;
  const blocks = React.useMemo(() => {
    return {
      resource: `${tab.id}--filter`,
      syncWithLocation: !popup && tab.locationSync,
      defaults: resource?.filter?.defaults,
      sort: dataStore.options.order,
      pageSize: dataStore.page.limit,
    };
  }, [tab, dataStore]);

  const [query, modifiers] = useListParams(blocks, !popup);

  const { filter = EMPTY_OBJECT } = query;
  //const prevFilter =
  const filterFields = React.useMemo(() => {
    const form = tab.filterForm?.schema?.fields ?? EMPTY_ARRAY;
    const side =
      tab.filterSidebar?.items
        ?.filter(
          (item) =>
            !!item.name &&
            [
              "group",
              "select",
              "mto",
              "m2m",
              "date",
              "datetime",
              "node",
            ].includes(item.widget!),
        )
        ?.map((item) => item.name!) ?? EMPTY_ARRAY;
    return {
      form,
      side,
    };
  }, [tab]);

  const [openState, setOpenState] = React.useState<{
    sideOpen?: boolean;
    formOpen?: boolean;
  }>(EMPTY_OBJECT);
  const openStateRef = React.useRef(openState);
  openStateRef.current = openState;

  const [formActive, sideActive] = React.useMemo(() => {
    const { form, side } = filterFields;
    const formActive = form.some((name) => filter[name] != null);
    const sideActive = side.some((name) => filter[name] != null);
    return [formActive, sideActive];
  }, [filter, filterFields]);

  const filterActions = React.useMemo(() => {
    return {
      setSideOpen(value: React.SetStateAction<boolean | undefined>) {
        const prev = openStateRef.current.sideOpen ?? false;
        if (typeof value === "function") {
          const cur = value(prev);
          if (prev != cur) {
            setOpenState({ ...openStateRef.current, sideOpen: cur });
          }
        } else if (prev !== (value ?? false)) {
          setOpenState({ ...openStateRef.current, sideOpen: value ?? false });
        }
      },
      setFormOpen(value: React.SetStateAction<boolean | undefined>) {
        const prev = openStateRef.current.formOpen ?? false;
        if (typeof value === "function") {
          const cur = value(prev);
          if (prev != cur) {
            setOpenState({ ...openStateRef.current, formOpen: cur });
          }
        } else if (prev !== (value ?? false)) {
          setOpenState({ ...openStateRef.current, formOpen: value ?? false });
        }
      },
    };
  }, [setOpenState]);

  const filters = React.useMemo(
    () => ({
      filterTabs: tab.filterTabs,
      filterSidebar: tab.filterSidebar,
      filterForm: tab.filterForm,
      filterDefaults: tab.filterDefaults,
      modifiers,
      query,
      formActive,
      sideActive,
      ...openState,
      ...filterActions,
    }),
    [query, modifiers, openState, formActive, sideActive, filterActions],
  );

  const queryRef = React.useRef<typeof query>(null);

  const optionsRef = React.useRef({} as SearchOptions);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const { page, pageSize, filter, sort, ready } = query;
    if (!ready) {
      return;
    }

    const prevQuery = queryRef.current;
    const prevFilter = prevQuery?.filter;
    queryRef.current = query;

    console.log(
      "FilterTabsBar :filter:",
      filter,
      ", prevFilter:",
      prevFilter,
      ", changed:",
      prevFilter !== filter,
    );

    const isChanged = (options: SearchOptions) => {
      //const limit = Math.max(1, pageSize ?? options.limit ?? 1);
      //const offset = (Math.max(page, 1) - 1) * limit;
      //const newPage = Math.floor(offset / limit) + 1;

      return (
        options.order !== sort /*|| limit !== pageSize || newPage !== page*/
      );
    };
    const context = resource.context;
    let options = optionsRef.current;
    let newDomain = options.domain;

    if (!isEqual(prevFilter, filter)) {
      newDomain = evalFilter(
        resource.filter!,
        filter,
        resource.evalContext,
        resource.props,
      )[1] as Domains;
    }

    newDomain = isEqual(options.domain, newDomain)
      ? options?.domain
      : newDomain;

    if (newDomain === options.domain && !isChanged(options)) {
      console.log("FilterTabsBar: no domain change:", newDomain);
      (modifiers as any).commit(false);
      setReady(true);
      return;
    }

    options = {
      ...options,
      domain: newDomain as Domains,
      //offset,
      //limit,
      context,
    };

    if (sort != null) {
      options.order = sort;
    }
    console.log("FilterTabsBar:domain:", newDomain);
    optionsRef.current = options;
    console.log("FilterTabsBar: commit");
    (modifiers as any).commit(true);
    setReady(true);
  }, [query]);

  const doSearch = React.useCallback(
    async (newOption?: SearchOptions) => {
      const options = optionsRef.current;

      //if (true) throw Error("Invalid search call");
      const domain = newOption
        ? [
            ...(options.domain ?? EMPTY_ARRAY),
            ...(newOption?.domain ?? EMPTY_ARRAY),
          ]
        : options.domain;

      console.log(
        "FilterTabsBar:: doSearch: d1:",
        options.domain,
        ", d2:",
        dataStore.options.domain,
      );

      const data = await dataStore.search({
        ...options,
        ...newOption,
        domain: domain,
        context: {},
        ...(!isEqual(domain, options.domain) && { offset: 0 }),
      });
      return data;
    },
    [dataStore],
  );

  React.useEffect(() => {
    return valueRef.current.bind!({ doSearch });
  }, [doSearch]);

  const value = React.useMemo(
    () => ({
      ...(valueProp as unknown as ViewProps<FormViewBlock>),
      doSearch,
      filters,
    }),
    [filters, valueProp, doSearch],
  );

  return (
    <ViewContext.Provider value={value}>
      {ready ? children : <Loader />}
    </ViewContext.Provider>
  );
};

function evalFilter(
  res: FilterView,
  filter: any,
  context: any,
  props: Schema["props"],
): [values: any, Domains[] | undefined] {
  const ctx = context._subContext({
    ...(isRecordProps(props) ? props : EMPTY_OBJECT),
    ...filter,
  });

  const newValues = {};

  const domains = buildDomain(
    {
      widget: "group",
      items: [res.form, res.sidebar].filter(Boolean),
    } as any,
    newValues,
    ctx,
  );

  console.log("evalFilter::domains:", domains);

  return [newValues, Array.isArray(domains) ? domains : undefined];
}
