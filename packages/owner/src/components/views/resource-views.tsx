import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  ContainerSizeProvider,
  Fade,
  useResizeDetector,
  useInViewport,
  Box,
  InViewProvider,
  InViewConsumer,
  useFloatingContext,
  useInViewContext,
} from "@funext/ui";

import { ErrorBox } from "~/components/app/error-box";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { useSession } from "~/hooks/use-session";
import { DataStore } from "~/utils/data-store";
import {
  isRecordProps,
  type DataContext,
  type Domains,
  type Schema,
  type SearchOptions,
  type FilterView,
  type ResourceView,
} from "~/utils/data-types";

import { ErrorBoundary, type FallbackProps } from "../app/error-boundary";
import { EMPTY_ARRAY, EMPTY_RECORD } from "~/utils/constant";
import { EvalDataContext, ResourceContext, ViewBlockContext } from "~/context";
import { useListParams } from "./useListParams";
import { createEvalContext } from "~/utils/eval-context";
import { buildDomain } from "~/utils/filter";
import type { Tab } from "./types";
import { BlockComponent, useRenderBlock } from "./block";
import type { ViewBlock } from "~/utils";
import { isEqual } from "lodash";

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
  const size = useResizeDetector(node, false);

  if (children) {
    //let child =
    return (
      <Box
        ref={ref}
        display="flex"
        flex={1}
        minWidth={0}
        minHeight={0}
        data-view-box={tab.state.block?.type}
      >
        <ContainerSizeProvider value={size}>
          <InViewProvider visible={visible}>
            <InViewConsumer>
              {({ hasVisible }) =>
                hasVisible ? (
                  <Fade in={hasVisible} timeout={400} mountOnEnter>
                    {children}
                  </Fade>
                ) : null
              }
            </InViewConsumer>
          </InViewProvider>
        </ContainerSizeProvider>
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

function ViewPane({ tab }: { tab: Tab }) {
  //const [type, setType] = useState(() => tab.state.type);
  const getType = useCallback(() => () => tab.state.type, [tab]);
  const type = useSyncExternalStore(tab.subscribe, getType);

  const Comp = useMemo(() => {
    const block = tab.state.block;
    if (!block.Comp) {
      block.Comp = BlockComponent;
    }
    return block.Comp;
  }, [type]);

  return (
    <ErrorBoundary
      fallback={ViewError}
      onReset={() => {}}
      onError={(error, info) => {
        console.log("----------------error---------------");
        console.error(error);
        console.log("----------------componentStack---------------");
        console.error(info?.componentStack);
      }}
    >
      <ViewBlockContext.Provider value={tab.state.block}>
        <ViewContainer tab={tab}>
          <div className="block w-full h-full">
            <Comp ctx={tab.action.evalContext} />
          </div>
        </ViewContainer>
      </ViewBlockContext.Provider>
    </ErrorBoundary>
  );
}

export type ViewsProps = {
  model?: string;
  tab: Tab;
};

const DataViews = function DataViews({
  tab,
  model,
}: {
  tab: Tab;
  model: string;
}) {
  const { action: resource } = tab;

  const { name: actionName, domain, context, params } = resource;

  const limit = +params?.limit;

  const popup = !!useFloatingContext() || !!tab.dashlet || !!tab.popup;

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

  const blocks = useMemo(() => {
    return {
      resource: tab.id,
      syncWithLocation: tab.locationSync,
      defaults: resource?.filter?.defaults,
      sort: dataStore.options.order?.join(","),
      pageSize: dataStore.page.limit,
    };
  }, [tab, dataStore]);

  const [query, modifiers] = useListParams(blocks, !popup);

  const { signature, page, pageSize, filter, sort } = query;

  // advanced search
  const [options, setOptions] = useState<SearchOptions>({});

  useAsyncEffect(async () => {
    const isChanged = (options: SearchOptions) => {
      const limit = Math.max(1, pageSize ?? options.limit ?? 1);
      const offset = (Math.max(page, 1) - 1) * limit;
      const newPage = Math.floor(offset / limit) + 1;

      return options.order !== sort || limit !== pageSize || newPage !== page;
    };

    let [_, domain] =
      resource && resource.filter
        ? evalFilter(resource.filter, filter, resource.props, context)
        : [null, null];

    setOptions((options) => {
      const newDomain = isEqual(options.domain, domain ?? options.domain)
        ? options?.domain
        : domain;

      if (newDomain === options.domain && !isChanged(options)) {
        return options;
      }

      const limit = Math.max(1, pageSize ?? options.limit ?? 1);

      const dsPage = dataStore.page;
      if (dsPage.pages && page > 1 && page > dsPage.pages) {
        modifiers.setPage(dsPage.pages);
        return options;
      }

      const offset = (Math.max(page, 1) - 1) * limit;

      options = {
        ...options,
        domain: newDomain as Domains,
        offset,
        limit,
        order: sort?.split(","),
        context,
      };

      return options;
    });
  }, [resource, setOptions, signature]);

  const doSearch = useCallback(
    async (newOption?: SearchOptions) => {
      const domain = [
        ...(options.domain ?? EMPTY_ARRAY),
        ...(newOption?.domain ?? EMPTY_ARRAY),
      ];
      return await dataStore.search({
        ...options,
        ...newOption,
        domain: domain.length ? domain : undefined,
        context: {},
      });
    },
    [dataStore, options],
  );

  if (!blocks) {
    return null;
  }

  return (
    <ResourceContext.Provider
      value={useMemo(
        () => ({
          listParams: query,
          modifiers,
          dataStore,
          tab,
          doSearch,
        }),
        [dataStore, blocks, signature, doSearch],
      )}
    >
      <ViewPane tab={tab} />
    </ResourceContext.Provider>
  );
};

function evalFilter(
  res: FilterView,
  filter: any,
  context: any,
  props: Schema["props"],
): [values: any, Domains[] | null] {
  const ctx = createEvalContext({
    ...context,
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

  return [newValues, Array.isArray(domains) ? domains : null];
}

export const Views = memo(function Views(props: ViewsProps) {
  const { model, ...others } = props;
  //const visible = useVisibility();

  return model ? (
    <DataViews model={model} {...others} />
  ) : (
    <ViewPane {...others} />
  );
});
