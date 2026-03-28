import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  Box,
  Flex,
  Spinner,
  useFloatingContext,
  useInViewport,
} from "@funext/ui";

import { ErrorBox } from "~/components/shared/error-box";
import { useSession } from "~/hooks/use-session";
import { DataStore } from "~/utils/data-store";
import {
  isRecordProps,
  type Domains,
  type FilterView,
  type ResourceView,
  type Schema,
  type SearchOptions,
} from "~/utils/data-types";

import { isEmpty, isEqual } from "lodash";
import { ResourceContext } from "~/context";
import { removeEmpty, type Container, type ViewBlock } from "~/utils";
import { EMPTY_ARRAY, EMPTY_OBJECT, EMPTY_RECORD } from "~/utils/constant";
import { buildDomain, type FilterTabs, type FilterWidget } from "~/utils/filter";
import {
  ErrorBoundary,
  type FallbackProps,
} from "../components/app/error-boundary";
import { BlockView, evalProps, renderBlockItems } from "./block/block";
import type { ListModifiers, ListParams, Tab } from "./types";
import { useListParams } from "./utils/useListParams";
import { ViewProvider } from "./view-provider";

type ViewContainerProps = {
  type: ResourceView["type"];
  tab: Tab;
  view: ViewBlock<ResourceView>;
};

function ViewContainer({
  tab,
  children,
}: {
  tab: Tab;
  children: React.ReactNode;
}) {
  const { visible, node, ref } = useInViewport(tab.state.block?.type);
  //const size = useResizeDetector(node, false);

  if (children) {
    //let child =
    return (
      <Box
        ref={ref}
        minWidth={0}
        minHeight={0}
        className="parent-view"
        data-ui="ViewContainer"
        data-view-box={tab.state.block?.type}
      >
        {children}
      </Box>
    );
  }

  return null;
}

function ViewError({ error, onReset }: FallbackProps) {
  const session = useSession();

  return (
    <ErrorBox
      status={500}
      error={session.data?.user?.technical ? error : undefined}
      onReset={onReset}
    />
  );
}

function ViewPane({ tab, dataStore, modifiers, query }: { tab: Tab; dataStore?: DataStore; 
  modifiers?: ListModifiers ;
  query?: ListParams;
}) {
  //const [type, setType] = useState(() => tab.state.type);
  console.log("ViewPane tab state:", tab.state);
  const getType = useCallback(() => tab.state.type, [tab]);
  const type = useSyncExternalStore(tab.subscribe, getType);
  const prevBlockRef = useRef<ViewBlock>();
  console.log("Change view type:", type);

  const children = useMemo(() => {
    if (tab.state.prevType !== type && tab.state.prevType) {
      const prevProp = tab.state.props?.[tab.state.prevType];
      if (prevProp?.actions?.saveState) {
        prevProp.actions.saveState(prevProp);
      }
    }
    if(prevBlockRef.current) {
      prevBlockRef.current.open = false;
    }
    const block = tab.state.block;
    block.open = true;
    prevBlockRef.current = block;
    console.log("Change view block type: ", block);
    if (!block) {
      return (
        <Flex items="center" justify="center" height="100%">
          <Spinner size={50} />
        </Flex>
      );
    }
    let extList:any;
    if(type === 'list') {
      let sidebar = tab.filter?.schema?.sidebar as Container<FilterWidget>;
      const tabs = sidebar?.items?.find((w) => w.widget === "tabs") as FilterTabs;
     
      if (tabs) {
        sidebar = {
          ...sidebar,
          items: sidebar!.items.filter((i) => i !== tabs),
        };
      }

      extList = removeEmpty( {
        filterTabs: tabs && tabs.items?.length && tabs.name ? tabs : undefined,
        filterSidebar: isEmpty(sidebar) ? undefined : sidebar,
        filterForm: tab.filter?.form,
        listParams: query,
        modifiers: modifiers,
        filterDefaults: tab.filter?.schema?.defaults
      })
    }
    const vProps = {
      dataStore: dataStore,
      view: block,
      evalContext: tab.action.evalContext,
      fields: tab.action.fields,
      ...extList
    };
    let props: any;
    if (true || type === 'list' || !(block as any).$props) {
      props = evalProps(block, vProps.evalContext) ?? {};
      const children = renderBlockItems(block, vProps.evalContext);
      if (children) props.children = children;
      block.props = props;
      (block as any).$props = props;
    } else {
      props = (block as any).$props;
      if (props.children) props.children = React.cloneElement(props.children);
    }

    const Comp = typeof block.tag === "function" ? block.tag : BlockView;
    const comp = (
      <ErrorBoundary
        //key={uniqueId("rend_")}
        fallback={ViewError}
        onReset={() => {}}
        onError={(error, info) => {
          console.log("----------------error---------------");
          console.error(error);
          console.log("----------------componentStack---------------");
          console.error(info?.componentStack);
        }}
      >
        <ViewProvider value={vProps}>
          <Comp {...props} />
        </ViewProvider>
      </ErrorBoundary>
    );

    return comp;
  }, [type, tab]);

  return (
    <ViewContainer tab={tab}>
      {children}
    </ViewContainer>
  );
}

export type ViewsProps = {
  model?: string;
  tab: Tab;
};

const ResourceViews = function DataViews({
  tab,
  model,
}: {
  tab: Tab;
  model: string;
}) {
  const { action: resource } = tab;

  const { domain, context, params } = resource;

  const limit = +params?.limit;

  // const popup = !!useFloatingContext() || !!tab.dashlet || !!tab.popup;

  console.log("DataViews:: new DataStore");

  const dataStore = useMemo(
    () =>
      new DataStore(model, {
        ...(limit && { limit }),
        domain,
        //params,
        context,
      }),
    [model, limit, domain],
  );

  const hasFilter =
    !!tab.filter && (tab.filter.form || tab.filter.schema.sidebar);

  return hasFilter ? (
    <ResourceFilterProvider tab={tab} dataStore={dataStore} />
  ) : (
    <ResourceProvider tab={tab} dataStore={dataStore} />
  );
};

const ResourceProvider = ({
  tab,
  dataStore,
}: {
  tab: Tab;
  dataStore: DataStore;
}) => {
  console.log("DataViews:: new DataStore");

  const doSearch = useCallback(
    async (newOption?: SearchOptions) => {
      if (true) throw Error("Invalid search call");
      return await dataStore.search(newOption ?? EMPTY_OBJECT);
    },
    [dataStore],
  );

  return (
    <ResourceContext.Provider
      value={useMemo(
        () => ({
          dataStore,
          tab,
          doSearch,
        }),
        [dataStore, doSearch],
      )}
    >
      <ViewPane tab={tab} dataStore={dataStore} />
    </ResourceContext.Provider>
  );
};

const ResourceFilterProvider = ({
  tab,
  dataStore,
}: {
  tab: Tab;
  dataStore: DataStore;
}) => {
  const resource = tab.action;
  const popup = !!useFloatingContext() || !!tab.dashlet || !!tab.popup;

  const blocks = useMemo(() => {
    return {
      resource: tab.id,
      syncWithLocation: !popup && tab.locationSync,
      defaults: resource?.filter?.defaults,
      sort: dataStore.options.order,
      pageSize: dataStore.page.limit,
    };
  }, [tab, dataStore]);

  const [query, modifiers] = useListParams(blocks, !popup);

  const { signature, page, pageSize, filter, sort } = query;

  const queryRef = useRef(query);
  
  // advanced search
  const [options, setOptions] = useState<SearchOptions>({});

  const optionsRef = useRef(options);
  optionsRef.current = options;

  React.useEffect(() => {
    const prevQuery = queryRef.current
    const prevFilter = prevQuery.filter;
    queryRef.current = query
    const { page, pageSize, filter, sort } = query;

    console.log("ResourceFilterProvider:filter:", filter, ", prevFilter:", prevFilter)

    const isChanged = (options: SearchOptions) => {
      const limit = Math.max(1, pageSize ?? options.limit ?? 1);
      const offset = (Math.max(page, 1) - 1) * limit;
      const newPage = Math.floor(offset / limit) + 1;

      return options.order !== sort || limit !== pageSize || newPage !== page;
    };
    const context = resource.context;
   
    setOptions((options) => {

      let newDomain = options.domain;
      if(!isEqual(prevFilter, filter)) {
        newDomain = evalFilter(resource.filter!, filter, resource.evalContext, resource.props)[1] as Domains
        
      }

      newDomain = isEqual(options.domain, newDomain)
        ? options?.domain
        : newDomain;
      
      

      if (newDomain === options.domain && !isChanged(options)) {
        return options;
      }

      const limit = Math.max(1, pageSize ?? options.limit ?? 1);

      const dsPage = dataStore.page;
      if (dsPage.pages && page > 1 && page > dsPage.pages) {
        const pp = dsPage.page;
        modifiers.setPageInfo({
          page: dsPage.page ?? 1,
          pages: dsPage.pages ?? 0,
          offset: dsPage.offset ?? 0,
          total: dsPage.total ?? 0,
        });
        
        //return options;
      }

      const offset = (Math.max(page, 1) - 1) * limit;

      options = {
        ...options,
        domain: newDomain as Domains,
        offset,
        limit,
        context,
      };

      if (sort != null) {
        options.order = sort;
      }
      console.log("ResourceFilterProvider:domain:", newDomain);
      return options;
    });

  }, [setOptions, query]);


  const doxSearch = useCallback(
    async (newOption?: SearchOptions) => {
      return await dataStore.search(newOption ?? EMPTY_OBJECT);
    },
    [dataStore],
  )
  const doSearch = useCallback(
    async (newOption?: SearchOptions) => {
      const options = optionsRef.current;
      //if (true) throw Error("Invalid search call");
      const domain = [
        ...(options.domain ?? EMPTY_ARRAY),
        ...(newOption?.domain ?? EMPTY_ARRAY),
      ];

      const data = await dataStore.search({
        ...options,
        ...newOption,
        domain: domain.length ? domain : undefined,
        context: {},
      });
      const page = dataStore.page;
      const ls = queryRef.current;
      if (
        page.limit !== ls.pageSize ||
        page.offset !== ls.offset ||
        page.page !== ls.page ||
        page.total !== ls.total ||
        page.pages !== ls.pages
      ) {
        modifiers.setPageInfo({
          page: page.page ?? 1,
          pages: page.pages ?? 0,
          offset: page.offset ?? 0,
          total: page.total ?? 0,
        });
      }
      if (page.limit !== ls.pageSize) {
        modifiers.setPageSize(page.limit ?? ls.pageSize);
      }

      return data;
    },
    [dataStore],
  );

  return (
    <ResourceContext.Provider
      value={useMemo(
        () => ({
          query,
          modifiers,
          dataStore,
          tab,
          doSearch,
        }),
        [dataStore, blocks, signature, doSearch],
      )}
    >
      <ViewPane tab={tab} dataStore={dataStore} query={query} modifiers={modifiers}/>
    </ResourceContext.Provider>
  );
};

function evalFilter(
  res: FilterView,
  filter: any,
  context: any,
  props: Schema["props"],
): [values: any, Domains[] | undefined] {
  const ctx = context._subContext({
    ...(isRecordProps(props) ? props : EMPTY_RECORD),
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

  console.log("evalFilter::domains:", domains)

  return [newValues, Array.isArray(domains) ? domains : undefined];
}

export const ResViews = memo(function Views(props: ViewsProps) {
  const { tab, model = tab.action.model } = props;
  //const visible = useVisibility();

  return model ? (
    <ResourceViews model={model} tab={tab} />
  ) : (
    <ViewPane tab={tab} />
  );
});
