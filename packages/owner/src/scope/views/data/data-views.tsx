import { memo, useCallback, useMemo, useState } from "react";

import {
  Box,
  ContainerSizeProvider,
  Fade,
  InViewConsumer,
  InViewProvider,
  useInViewport,
  useResizeDetector,
} from "@funext/ui";

import { ErrorBox } from "~/components/shared/error-box";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { useSession } from "~/hooks/use-session";
import { DataStore } from "~/utils/data-store";
import {
  type AdvancedSearchState,
  type Criteria,
  type DataContext,
  type Domains,
  type Filter,
  type Property,
  type SearchFilter,
  type SearchOptions,
} from "~/utils/data-types";

import { useParams } from "react-router";
import { ViewDataContext } from "~/context";
import {
  ErrorBoundary,
  type FallbackProps,
} from "../../../components/app/error-boundary";
//import { prepareAdvanceSearchQuery } from "../../../scope/utils";

type CompType = React.FC<any> | React.ElementType;

function ViewContainer({ Comp }: { Comp: CompType }) {
  const { visible, node, ref } = useInViewport((Comp as any)?.displayName);
  const size = useResizeDetector(node, false);

  const [memoSize, setMemoSize] = useState(size);

  if (Comp) {
    return (
      <Box
        ref={ref}
        display="flex"
        flex={1}
        minWidth={0}
        data-view-box={(Comp as any)?.displayName}
        data-bk-size={memoSize.current}
        data-bk-width={memoSize.width ? `${memoSize.width}` : undefined}
      >
        <ContainerSizeProvider value={memoSize}>
          <InViewProvider visible={visible}>
            <InViewConsumer>
              {({ hasVisible }) =>
                hasVisible ? (
                  <Fade in={hasVisible} timeout={400} mountOnEnter>
                    <Comp />
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

function ViewPane({ Comp }: { Comp: CompType }) {
  const [state, setState] = useState(0);
  return (
    <ErrorBoundary
      key={`ss-${state}`} 
      fallback={ViewError}
      onReset={() => setState((s) => s + 1 )}
      onError={(error, info) => {
        console.log("----------------error---------------");
        console.error(error);
        console.log("----------------componentStack---------------");
        console.error(info?.componentStack);
      }}
    >
      <ViewContainer Comp={Comp} />
    </ErrorBoundary>
  );
}

export type DataViewsProps = {
  model?: string;
  searchState?: AdvancedSearchState;
  mode?: "details" | "list";
  context?: DataContext;
  limit?: number;
  domain?: Domains;
  params?: any;
  Comp: CompType;
};

const XViews = function DataViews({
  model,
  searchState: searchStateProps,
  mode,
  context,
  limit,
  domain,
  params: paramsProps,
  Comp,
}: DataViewsProps & { model: string }) {
  const rParams = useParams();

  const uParams = paramsProps || {};

  console.log("DataViews:: new DataStore");

  const dataStore = useMemo(
    () =>
      new DataStore(model, {
        ...(limit && { limit }),
        ...(Array.isArray(domain) && domain.length && { domain }),
        //params,
        context,
      }),
    [model, limit, ...(Array.isArray(domain) ? domain : [])],
  );

  // advanced search
  const [search, setSearch] = useState<AdvancedSearchState>(
    searchStateProps || {},
  );

  useAsyncEffect(async () => {
    let domains: SearchFilter[] = [];
    let items: Property[] = [];
    let fields: Record<string, Property> = {};

    setSearch((_state: any) => {
      const state = {
        ..._state,
        domains,
        items,
        fields: {
          ..._state.fields,
          ...fields,
        },
      };
      return { ...state /*...prepareAdvanceSearchQuery(state) */ };
    });
  }, [model, setSearch]);

  const doSearch = useCallback(
    async (options?: SearchOptions) => {
      let newDomain: any[] = [];
      const visit = (criteria?: Criteria) => {
        criteria?.criteria?.map((s) => {
          if ((s as Filter).fieldName) {
            const filter = s as Filter;
            if (filter.value2) {
              newDomain.push([filter.fieldName, ">=", filter.value]);
              newDomain.push([filter.fieldName, "<=", filter.value2]);
            } else {
              newDomain.push([filter.fieldName, filter.operator, filter.value]);
            }
          } else {
            if (s.operator) newDomain.push(s.operator);
            visit(s as Criteria);
          }
        });
      };

      if (domain) {
        newDomain = [domain, ...newDomain];
      }
      if (options?.domain) {
        newDomain = [options.domain, ...newDomain];
      }

      return await dataStore.search({
        ...options,
        context: {},
        domain: newDomain,
      });
    },
    [dataStore, setSearch, search],
  );

  return (
    <ViewDataContext.Provider
      value={useMemo(
        () => ({ dataStore, search, setSearch, doSearch }),
        [dataStore, search, setSearch, doSearch],
      )}
    >
      <ViewPane Comp={Comp} />
    </ViewDataContext.Provider>
  );
};

export const DataViews = memo(function Views(props: DataViewsProps) {
  const { model, ...others } = props;
  //const visible = useVisibility();

  return model ? (
    <XViews model={model} {...others} />
  ) : (
    <ViewPane {...others} />
  );
});
