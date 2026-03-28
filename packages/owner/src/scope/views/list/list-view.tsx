import type { VirtualScrollerInitialParams } from "@af-utils/virtual-core";
import {
  Stack,
  useLazyRef,
  useScreenSize,
  type SxComponentProps,
} from "@funext/ui";
import * as React from "react";
import { ViewLayout } from "~/components/layout/view-layout";
import {
  createVirtualItemRef,
  VirtualList,
  type VirtualListItemProps,
  type VirtualScroller,
} from "~/components/shared/virtual-list";
import {
  EvalDataContext,
  ListViewContext,
  RecordContext,
  useEvalDataContext,
  useListView,
  useRecord,
  useResourceContext,
  useViewContext,
  type ListViewValue,
} from "~/context";
import { useViewSwitch } from "~/scope/routes/use-tabs";
import {
  DataStore,
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  isPlainObject,
  isSchemaBlock,
  type Block,
  type Container,
  type DataContext,
  type DataRecord,
  type Identifier,
  type ListViewBlock,
  type SearchOptions,
  type WidgetBlock,
} from "~/utils";
import format from "~/utils/format";
import {
  getBlockItems,
  meta,
  useRenderBlock,
  WidgetBlockProvider,
} from "../../block";
import type {
  BlockMeta,
  IndexRecord,
  ResourceContext,
  WidgetBlockProps,
} from "../../types";
import { StateWidget } from "./widgets";
import { useScheduleLayoutEffect } from "~/hooks/use-schedule-layout-effect";
import type { FilterTabs, FilterWidget } from "~/utils/filter";
import { FilterSidebar, FilterTabsBar } from "~/scope/filter";

export function ListView(
  props: SxComponentProps & { virtual?: boolean; estimatedItemSize?: number },
) {
  const { children, ref, estimatedItemSize } = props;
  console.log("ListView::props:", props);
  const { tab, dataStore, doSearch } = useResourceContext();
  const action = tab.action;

  const filterTabs = React.useMemo(() => {
    let sidebar = tab.filter?.schema?.sidebar as Container<FilterWidget>;
    const tabs = sidebar?.items?.find((w) => w.widget === "tabs") as FilterTabs;
    const filterTabs =
      tabs && tabs.options?.length && tabs.name ? tabs : undefined;
    return filterTabs;
  }, [tab.filter]);

  const [itemBlock, setItemBlock] = React.useState<Block>(() => {
    return getBlockItems(
      getBlockItems(tab.state.block!).find(
        (bloc) => isSchemaBlock(bloc) && bloc.type === "Block",
      ),
    )[0];
  });

  const switchTo = useViewSwitch();

  const getContext = React.useCallback(
    (record: IndexRecord) => {
      const rec = isPlainObject(record)
        ? record
        : (dataStore.records[record] ?? {});
      const newContext = action.evalContext._subContext(rec);
      return newContext;
    },
    [action],
  );

  const showDetail = React.useCallback(
    async (record: DataRecord | Identifier) => {
      const identifier = isPlainObject(record) ? record.id : record;
      switchTo("form", { route: { id: String(identifier ?? "") } });
    },
    [switchTo],
  );

  const render = useRenderBlock();

  const showDetailRef = useLazyRef(() =>
    tab.action.views.some((view) => view.type === "form")
      ? showDetail
      : undefined,
  );

  return (
    <ListViewContext.Provider
      value={React.useMemo(() => {
        //const canShow = tab.action.views.some((view) => view.type === "form");

        return {
          itemBlock,
          setItemBlock,
        } as unknown as ListViewValue;
      }, [itemBlock])}
    >
      <Stack className="parent-view" ref={ref} data-ui="ListView" width="100%">
        <span className="hidden">{children}</span>
        <ViewLayout>
          {itemBlock && (
            <VirtualListView
              getContext={getContext}
              showDetail={showDetailRef.current}
              render={render}
              dataStore={dataStore}
              doSearch={doSearch}
              itemBlock={itemBlock}
              estimatedItemSize={estimatedItemSize}
              filterTabs={filterTabs}
            />
          )}
        </ViewLayout>
      </Stack>
    </ListViewContext.Provider>
  );
}
//export function ListItem(props
function View() {}

type ViewProps = SxComponentProps & {
  getContext: (record: IndexRecord) => DataContext;
  showDetail?: (record: DataRecord | Identifier, option?: {}) => Promise<void>;
  itemBlock: Block;
  render: (
    block: Block,
    context: object,
    ref?: React.Ref<any>,
  ) => React.ReactNode;
  dataStore: DataStore;
  doSearch: ResourceContext["doSearch"];
  estimatedItemSize?: number;
  filterTabs?: FilterTabs;
};

function VirtualListView({
  getContext,
  showDetail,
  itemBlock,
  render,
  dataStore,
  doSearch,
  estimatedItemSize,
  ...props
}: ViewProps) {
  const { mdDown, smDown } = useScreenSize();
  const context = useViewContext<ListViewBlock>();
  const { filterTabs, filterSidebar } = context;

  const isLoadingRef = React.useRef(false);
  const [model, setModel] = React.useState<VirtualScrollerInitialParams>(
    () => ({
      itemCount: undefined,
      estimatedItemSize,
    }),
  );

  const lastOffsetRef = React.useRef(-1);
  const pageRef = React.useRef(dataStore.page);
  const [state, setState] = React.useState<"loading" | unknown | undefined>();
  const [counter, setCounter] = React.useState(0);
  const [records, setRecords] = React.useState([]);

  const search = React.useCallback(
    async (option?: SearchOptions) => {
      try {
        setState("loading");
        isLoadingRef.current = true;
        const result = await doSearch(option);
        console.log("VirtualListView::search:", result);
        setState(undefined);
        setCounter((prev) => prev + 1);
        setRecords(dataStore.records);

        return result;
      } catch (e) {
        console.error(e);
        setState(e);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [doSearch],
  );

  const schedule = useScheduleLayoutEffect();

  const fetch = React.useCallback(
    async (offset: number) => {
      if (lastOffsetRef.current === offset || isLoadingRef.current) {
        return Promise.resolve();
      }
      lastOffsetRef.current = offset;
      setState("loading");
      schedule(1, () => search({ offset }));
      console.log("VirtualView::fetch:offset:", offset);
      return Promise.resolve();
    },
    [search],
  );

  React.useEffect(() => {
    return dataStore.subscribe(() => {
      let page = pageRef.current ?? EMPTY_OBJECT;
      let nPage = dataStore.page;
      pageRef.current = nPage;

      setModel((prevModel) => {
        if (prevModel.itemCount === nPage.total || nPage.total === undefined) {
          return prevModel;
        }
        console.log("VirtualView::change::model");
        return {
          ...prevModel,
          itemCount: nPage.total,
          overscanCount: nPage.offset ?? 0,
        };
      });

      setState(undefined);
    });
  }, [dataStore]);

  React.useEffect(() => {
    context.bind({ search });
    //search()
  }, [context, search]);

  //const records = dataStore.records;
  const modelData = React.useMemo(() => {
    return {
      records: dataStore.records,
      getContext,
      showDetail,
      render,
      itemBlock,
    };
  }, [records, getContext, showDetail, render, itemBlock, model]);

  React.useEffect(() => {
    const tm = setTimeout(() => (lastOffsetRef.current = -1), 3000);
    return () => {
      clearTimeout(tm);
    };
  }, [records]);

  console.log("VirtualView::records:", records);

  const renderHeader = React.useCallback(
    (model?: VirtualScroller) => {
      if (smDown && filterSidebar && filterTabs) {
        return (
          <Stack
            width="100%"
            height={50}
            ref={(el: any) => model?.setStickyHeader(el)}
          >
            <FilterSidebar mode="tags" />
            <FilterTabsBar tabs={filterTabs} />
          </Stack>
        );
      }
      if (smDown && filterSidebar)
         return <FilterSidebar mode="tags" />
      
      return (
        filterTabs && (
          <FilterTabsBar
            tabs={filterTabs}
            ref={(el: any) => model?.setStickyHeader(el)}
          />
        )
      );
    },
    [smDown, filterTabs, filterSidebar],
  );
  
  return (
    <>
    {renderHeader()}
    <VirtualList
      {...props}
      Item={VirtualItem}
      model={model}
      itemData={modelData}
      fetch={fetch}
      state={state ? (state === "loading" ? state : "error") : undefined}
      className="h-full "
      //renderHeader={renderHeader}
    />
    </>
  );
}

VirtualListView.displayName = "VirtualListView";

type ViewModelData = {
  getContext: (record: IndexRecord) => DataContext;
  showDetail?: (record: DataRecord | Identifier, option?: {}) => Promise<void>;
  itemBlock: Block;
  render: (
    block: Block,
    context: object,
    ref?: React.Ref<any>,
  ) => React.ReactNode;
  records: DataRecord[];
  doSearch: ResourceContext["doSearch"];
};

const VirtualItem = React.memo(({ i, data, model }: VirtualListItemProps) => {
  const { records, getContext, showDetail, render, itemBlock } =
    data as unknown as ViewModelData;

  const record = records[i];
  const context = React.useMemo(() => getContext(record), [getContext, record]);
  console.log("VirtualItem render: ", { record, itemBlock });
  return (
    <RecordContext.Provider value={record}>
      <EvalDataContext.Provider value={context}>
        {render(itemBlock, context, createVirtualItemRef(model, i))}
      </EvalDataContext.Provider>
    </RecordContext.Provider>
  );
});

VirtualItem.displayName = "VirtualItem";

const ListField = meta<WidgetBlockProps>(
  ({ children, block, ref, ...props }) => {
    const context = useEvalDataContext();
    const record = useRecord();
    if (children) {
      return (
        <WidgetBlockProvider block={block as WidgetBlock}>
          <span {...props} ref={ref}>
            {children}
          </span>
        </WidgetBlockProvider>
      );
    }
    return (
      <span {...props} ref={ref}>
        {format(record[block.schema.name!], {
          context,
          props: block.schema,
        })}
      </span>
    );
  },
  {
    wrap: "prop",
  },
);

ListField.displayName = "ListField";

const ListBlock = meta(
  ({ block }: { block: WidgetBlock }) => {
    const { setItemBlock } = useListView();
    React.useEffect(() => {
      console.log("ListBlock first child: ", getBlockItems(block)[0]);
      setItemBlock(getBlockItems(block)[0]);
    }, EMPTY_ARRAY);
    return <span data-ui="ListViewBlock" />;
  },
  {
    wrap: "prop",
    noProps: true,
  },
);

ListBlock.displayName = "ListBlock";

const RootList = meta(ListView, {
  raw: true,
});

const Wrapper = ({ block }: { block: any }) => {
  return <StateWidget block={block} />;
};

const listMeta: Readonly<BlockMeta> = Object.freeze({
  wrap: Wrapper,
  noProps: true,
});

export const List = {
  //List: ListView,
  list: RootList,
  Field: ListField,
  Block: ListBlock,
  listMeta,
};
