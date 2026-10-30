import React, {
  memo,
  useMemo,
  useRef,
  useSyncExternalStore
} from "react";

import {
  Box,
  Flex,
  Spinner,
  useInViewport
} from "~/ui";

import { ErrorBox } from "~/components/shared/error-box";
import { useSession } from "~/hooks/use-session";
import { DataStore } from "~/utils/data-store";

import { isEqual } from "lodash";
import { Layout } from "~/components/layout/layout";
import { EvalDataContext, ResourceContext, ViewContext } from "~/context";
import { type ViewBlock } from "~/utils";
import { EMPTY_OBJECT } from "~/utils/constant";
import {
  ErrorBoundary,
  type FallbackProps,
} from "../components/app/error-boundary";
import { getMeta } from "./block";
import { evalProps, renderBlockItems, unSafeRenderBlock } from "./block/block";
import type { Tab } from "./types";
import { ViewProvider } from "./view-provider";

function ViewContainer({
  tab,
  children,
}: {
  tab: Tab;
  children: React.ReactNode;
  hasError?: boolean;
}) {
  const { ref } = useInViewport(tab.state.block?.type);
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
      onRetry={onReset}
    />
  );
}
function ChildView({ children }: any) {
  return children;
}
function ViewPane({ tab, dataStore }: { tab: Tab; dataStore?: DataStore }) {
  //const [type, setType] = useState(() => tab.state.type);
  console.log("ViewPane tab state:", tab.state);
  const getType = useMemo(() => {
    function update() {
      return {
        type: tab.state.type,
        pending: tab.state.pending,
        error: tab.state.pendingResult?.error,
        onRetry: tab.state.pendingResult?.retry,
      };
    }
    let result = update();
    let prevSate = tab.state;
    return () => {
      if (prevSate === tab.state) {
        return result;
      }
      prevSate = tab.state;
      const newResult = update();
      console.log("ViewPane: changed:", !isEqual(result, newResult))
      result = isEqual(result, newResult) ? result : newResult;
      
      return result;
    };
  }, [tab]);
  const { type, pending, error, onRetry } = useSyncExternalStore(
    tab.subscribe,
    getType,
  );
  const prevBlockRef = useRef<ViewBlock>(null);
  console.log("ViewPane:: Change view type:", type);

  const children = useMemo(() => {
    console.log("Change Render children:", type);
    if (tab.state.prevType !== type && tab.state.prevType) {
      const prevProp = tab.state.props?.[tab.state.prevType];
      if (prevProp?.actions?.saveState) {
        prevProp.actions.saveState(prevProp);
      }
    }
    if (prevBlockRef.current) {
      prevBlockRef.current.open = false;
    }
    const block = tab.state.block;
    block.open = true;
    prevBlockRef.current = block;

    if (!block) {
      return (
        <Flex items="center" justify="center" height="100%">
          <Spinner size={50} />
        </Flex>
      );
    }
    /*
    if (block.$rend) {
      return block.$rend;
    }*/

    const vProps = {
      view: block,
    };
    let props: any;
    const ctx = pending
      ? tab.action.evalContext._subContext({ onRetry, error, pending })
      : tab.action.evalContext;

    console.log("ViewPane:: Change view block: ", block);

    props = !getMeta(block.tag) ? (evalProps(block, ctx) ?? {}) : undefined;
    const children = props ? renderBlockItems(block, ctx) : undefined;
    if (children) props.children = children;
    if (props) block.props = props;
    const Comp = typeof block.tag === "function" ? block.tag : ChildView;
    
    
    if (pending) {
      return (
        <EvalDataContext value={ctx}>
          <ViewContext.Provider value={vProps}>
            <Comp {...props} />
          </ViewContext.Provider>
        </EvalDataContext>
      );
    }

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
          {unSafeRenderBlock(block, ctx)}
        </ViewProvider>
      </ErrorBoundary>
    );
    //block.$rend = comp;
    return comp;
  }, [tab, type, pending, error, dataStore]);

  let container = <ViewContainer tab={tab}>{children}</ViewContainer>;
  if (!!error) {
    container = (
      <Layout props={EMPTY_OBJECT} type={undefined} enable>
        {container}
      </Layout>
    );
  }
  return container;
}

export type ViewsProps = {
  model?: string;
  tab: Tab;
  pending?: boolean;
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

  return (
    <ResourceContext.Provider
      value={useMemo(
        () => ({
          dataStore,
          tab,
        }),
        [dataStore, tab],
      )}
    >
      <ViewPane tab={tab} />
    </ResourceContext.Provider>
  );
};

const NullDataStoreViews = memo(function Views({ tab }: { tab: Tab }) {
  return (
    <ResourceContext.Provider value={{ tab }}>
      <ViewPane tab={tab} />
    </ResourceContext.Provider>
  );
});

export const ResViews = memo(function Views(props: ViewsProps) {
  const { tab, model = tab.action.model } = props;
  //const visible = useVisibility();

  return model ? (
    <ResourceViews model={model} tab={tab} />
  ) : (
    <NullDataStoreViews tab={tab} />
  );
});
