import type { VirtualScrollerInitialParams } from "@af-utils/virtual-core";
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
  useViewContext,
  type ListViewValue,
} from "~/context";
import { useScheduleLayoutEffect } from "~/hooks/use-schedule-layout-effect";
import { FilterSidebar, FilterTabsBar } from "~/scope/filter";
import { useViewSwitch } from "~/scope/routes/use-tabs";
import { Box, Stack, useLazyRef, useScreenSize, type SxComponentProps } from "~/ui";
import {
  DataStore,
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  isPlainObject,
  isSchemaBlock,
  type Block,
  type DataContext,
  type DataRecord,
  type Identifier,
  type ListViewBlock,
  type SearchOptions,
  type WidgetBlock,
} from "~/utils";
import type { FilterTabs } from "~/utils/filter";
import format from "~/utils/format";
import {
  getBlockItems,
  meta,
  useRenderBlock,
  WidgetBlockProvider,
} from "../../block";
import type { IndexRecord, WidgetBlockProps } from "../../types";
import { StateWidget } from "./widgets";
import { Toolbar } from "~/components";
import { Root } from "./list";

export function ListView(
  props: SxComponentProps & { 
    virtual?: boolean; 
    estimatedItemSize?: number;
    withFields?: boolean;
  },
) {
  const { children, ref, virtual, estimatedItemSize, withFields=true } = props;

  const {filters, dataStore, view, evalContext, bind } = useViewContext<ListViewBlock>();
  const {filterTabs, filterSidebar } = filters;
  const [itemBlock, setItemBlock] = React.useState<Block>(() => {
    return getBlockItems(
      getBlockItems(view).find(
        (bloc) => isSchemaBlock(bloc) && bloc.type === "Block",
      ),
    )[0];
  });

  console.log("ListView:: ", { props, dataStore, itemBlock, evalContext });

  //const switchTo = useViewSwitch();

  const getContext = React.useCallback(
    (record: IndexRecord) => {
      const rec = isPlainObject(record)
        ? record
        : (dataStore.records[record] ?? {});
      const newContext = evalContext._subContext(rec);
      return newContext;
    },
    [evalContext],
  );

  const render = useRenderBlock();

  return (
    <ListViewContext.Provider
      value={React.useMemo(() => {
        return {
          itemBlock,
          setItemBlock,
        } as unknown as ListViewValue;
      }, [itemBlock])}
    >
      <Box className="parent-view" ref={ref} data-ui="ListView" width="100%">
        <span className="hidden">{children}</span>
        <ViewLayout>
          {itemBlock && dataStore && (
            <Root
              getContext={getContext}
              render={render}
              itemBlock={itemBlock}
              estimatedItemSize={estimatedItemSize}
              withFields={withFields}
              dataStore={dataStore}
              filterTabs={filterTabs}
              filterSidebar={filterSidebar} 
              virtual={virtual}
              primary={true}
              bind={bind}
            />
          )}
        </ViewLayout>
      </Box>
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
  estimatedItemSize?: number;
  filterTabs?: FilterTabs;
  withFields: boolean
};

function VirtualListView({
  getContext,
  itemBlock,
  render,
  estimatedItemSize,
  withFields,
  ...props
}: ViewProps) {
  const { mdDown, smDown } = useScreenSize();
  const context = useViewContext<ListViewBlock>();
  const { filters = EMPTY_OBJECT, dataStore, view } = context;
  const { filterTabs, filterSidebar } = filters;

  const [listState, setListState] = React.useState<{
    scroller: VirtualScrollerInitialParams,
    records: DataRecord[],
    page: number,
    status?: "loading" | unknown | undefined
  }>(() => ({
      scroller: {
        itemCount: undefined,
        estimatedItemSize,
        overscanCount: 5,
      },
      records: EMPTY_ARRAY as DataRecord[],
      page: 0,
    })
  );

  const pageRef = useLazyRef(()=> ({
    page: dataStore.page,
    lastOffset: dataStore.records.length || -1,
    isLoading: false,
  }))
 

  const search = React.useCallback(
    async (option?: SearchOptions) => {
      try {
        pageRef.current.isLoading = true;
        console.warn("VirtualListView::search: option:", option);
        setListState((prev) => ({...prev, status: "loading"}));
        const result = await context.doSearch({
          ...option,
          fields: withFields ? view.schema.fields : undefined,
          infinite: true,
        });
        console.log("VirtualListView::search:", result);
        setListState((prev) => ({...prev, status: undefined}));
        
        return result;
      } catch (e) {
        pageRef.current.lastOffset = dataStore.records.length;
        console.error(e);
        setListState((prev) => ({...prev, status: e}));
        return Promise.resolve({
          page: context.dataStore.page,
          records: context.dataStore.records,
        });
      } finally {
        pageRef.current.isLoading = false;
      }
    },
    [context.doSearch],
  );

  React.useEffect(() => {
    return context.bind({ search });
  }, [context.bind, search]);



  const fetch = React.useCallback(
    async (offset: number) => {
      const {page, lastOffset, isLoading} = pageRef.current;
      if (
        lastOffset === offset ||
        isLoading ||
        offset < dataStore.records.length ||
        ( page.total != null &&
          page.limit != null &&
          (page.limit + offset) >=  page.total
        )
      ) {
        return Promise.resolve();
      }
      pageRef.current.lastOffset = offset;
      pageRef.current.isLoading = true;

      console.log("VirtualListView::fetch:offset:", { offset, lastOffset });
      return await search({ offset });
    },
    [search],
  );

  React.useEffect(() => {
    pageRef.current.page = dataStore.page;
    setListState((prev) => ({
      ...prev,
      scroller: {
        ...prev.scroller,
        itemCount: dataStore.records.length
      },
      records: dataStore.records,
      page: dataStore.page.page ?? 0
    }));

    return dataStore.subscribe(() => {
      let page = dataStore.page;
      let records = dataStore.records;
      pageRef.current.page = page;
      console.log("VirtualListView::change: dataStore:", {
        ...page,
        recordCount: records.length,
      });
      setListState((prev) => ({
        ...prev,
        scroller: prev.scroller.itemCount === records.length
         ? prev.scroller
         : {
          ...prev.scroller,
          itemCount: records.length
        },
        records,
        page: page.page ?? 0
      }));
    });
  }, [dataStore]);

  
  const {records, scroller, status} = listState;

  const modelData = React.useMemo(() => {
    return {
      records: records,
      getContext,
      render,
      itemBlock,
    };
  }, [records, getContext, render, itemBlock]);

  console.log("VirtualListView::records:", records);
  
  const renderHeader = React.useCallback(
    (model?: VirtualScroller) => {
      return (((filterSidebar && smDown) || filterTabs) && (
            <Stack
              className="sticky top-0 bg-card"
              width="100%"
              ref={(el: any) => model?.setStickyHeader(el)}
            >
              {filterSidebar && smDown && <FilterSidebar mode="tags" />}
              {filterTabs && <FilterTabsBar tabs={filterTabs} />}
            </Stack>
          ));
    },
    [smDown, filterTabs, filterSidebar],
  );

  return (
      <VirtualList
        {...props}
        Item={VirtualItem}
        model={scroller}
        itemData={modelData}
        fetch={fetch}
        state={status ? (status === "loading" ? status : "error") : undefined}
        className="h-full"
        renderHeader={renderHeader}
      />
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
};

const VirtualItem = React.memo(({ i, data, model }: VirtualListItemProps) => {
  const { records, getContext, showDetail, render, itemBlock } =
    data as unknown as ViewModelData;

  const record = records[i];
  const context = React.useMemo(() => record ? getContext(record) : EMPTY_OBJECT, [getContext, record]);
  console.log("VirtualItem render: ", { record, itemBlock });
  delete (itemBlock as any).$frame;

  if (!record) return null;

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
    //console.log("ListField: format:", {record, value: record[block.schema.name!], props: block.schema})
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
      console.log("ListBlock block:", block);
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

const Wrapper = meta(StateWidget, {
  wrap: "prop",
  noProps: true,
});

export const List = {
  //List: ListView,
  list: RootList,
  Field: ListField,
  Block: ListBlock,
  Wrapper,
};
