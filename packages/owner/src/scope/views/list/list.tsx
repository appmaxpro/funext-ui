import React from "react";
import { Toolbar } from "~/components";
import {
  createVirtualItemRef,
  VirtualList as VList,
  type VirtualListItemProps,
  type VirtualScroller,
} from "~/components/shared/virtual-list";
import { EvalDataContext, LayoutContext, RecordContext } from "~/context";
import type { IndexRecord } from "~/scope";
import { FilterSidebar } from "~/scope/filter/filter-sidebar";
import { FilterTabsBar } from "~/scope/filter/filter-tabs-bar";
import {
  Box,
  Stack,
  useRefs,
  useScreenSize,
  type BoxProps,
  type SxComponentProps,
} from "~/ui";
import {
  DataStore,
  EMPTY_OBJECT,
  type Block,
  type Container,
  type DataContext,
  type DataRecord,
  type SearchOptions,
  type SearchResult,
} from "~/utils";
import type { FilterTabs, FilterWidget } from "~/utils/filter";
import { useList } from "./use-list";

type Render = (
  block: Block,
  context: object,
  ref?: React.Ref<any>,
) => React.ReactNode;

type RootProps = SxComponentProps & {
  getContext: (record: IndexRecord) => DataContext;
  itemBlock: Block;
  render: Render;
  dataStore: DataStore;
  estimatedItemSize?: number;
  filterTabs?: FilterTabs;
  filterSidebar?: Container<FilterWidget>;
  fields: string[];
  doSearch(option?: SearchOptions | undefined): Promise<SearchResult>;
  bind?({ search }: { search: RootProps["doSearch"] }): () => void;
  virtual?: boolean;
  primary?: boolean;
};

export function Root({
  getContext,
  itemBlock,
  filterTabs,
  filterSidebar,
  render,
  dataStore,
  estimatedItemSize,
  doSearch,
  virtual = true,
  primary,
  bind,
  fields,
  ...props
}: RootProps) {
  const { smDown } = useScreenSize();

  const { search, fetch, scroller, status, records } = useList({
    dataStore,
    doSearch,
    estimatedItemSize,
    fields
  });

  React.useEffect(() => {
    return bind?.({ search });
  }, [bind, search]);

  const itemData = React.useMemo(() => {
    return {
      records,
      getContext,
      render,
      itemBlock,
    };
  }, [records, getContext, render, itemBlock]);

  const renderHeader = React.useCallback(
    (model?: VirtualScroller) => {
      return (
        ((filterSidebar && smDown) || filterTabs) && (
          <Stack
            className={model ? "sticky top-0 bg-card" : "bg-card"}
            width="100%"
            ref={(el: any) => model?.setStickyHeader(el)}
          >
            {filterSidebar && smDown && <FilterSidebar mode="tags" />}
            {filterTabs && <FilterTabsBar tabs={filterTabs} />}
          </Stack>
        )
      );
    },
    [smDown, filterTabs, filterSidebar],
  );

  if (virtual) {
    return (
      <VList
        {...props}
        primary={primary}
        withLayoutScroller={false}
        component={primary ? ScrollerList : undefined}
        Item={VirtualItem}
        model={scroller}
        itemData={itemData}
        fetch={fetch}
        state={status ? (status === "loading" ? status : "error") : undefined}
        className="h-full"
        renderHeader={renderHeader}
      />
    );
  }

  return (
    <PlainList {...props}>
      {primary && <Toolbar />}
      {primary && renderHeader()}
      <ItemsList itemData={itemData} />
    </PlainList>
  );
}

type ItemData = {
  getContext: (record: IndexRecord) => DataContext;
  itemBlock: Block;
  render: Render;
  records: DataRecord[];
};

const VirtualItem = React.memo(({ i, data, model }: VirtualListItemProps) => {
  const { records, getContext, render, itemBlock } =
    data as unknown as ItemData;

  const record = records[i];
  const context = React.useMemo(
    () => (record ? getContext(record) : EMPTY_OBJECT),
    [getContext, record],
  );
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

const ScrollerList = React.forwardRef<HTMLElement, any>(
  ({ children, primary, ...props }, forwardRef) => {
    const { setScrollerRef } = React.useContext(LayoutContext) ?? EMPTY_OBJECT;
    const ref = useRefs(forwardRef, setScrollerRef);
    return (
      <Box data-ui="ScrollerList" {...props} ref={primary ? ref : forwardRef}>
        {primary && <Toolbar />}
        {children}
      </Box>
    );
  },
);

ScrollerList.displayName = "ScrollerList";

function PlainList({ ref, ...props }: BoxProps) {
  return <Stack width="100%" data-ui="PlainList" {...props} ref={ref} />;
}

const Item = React.memo(({ i, data }: { i: number; data: ItemData }) => {
  const { records, getContext, render, itemBlock } =
    data as unknown as ItemData;

  const record = records[i];
  const context = React.useMemo(
    () => (record ? getContext(record) : EMPTY_OBJECT),
    [getContext, record],
  );
  console.log("Item render: ", { record, itemBlock });
  delete (itemBlock as any).$frame;
  
  if (!record) return null;

  return (
    <RecordContext.Provider value={record}>
      <EvalDataContext.Provider value={context}>
        {render(itemBlock, context)}
      </EvalDataContext.Provider>
    </RecordContext.Provider>
  );
});

function ItemsList({ itemData }: { itemData: ItemData }) {
  const { records } = itemData;
  return records.map((rec, index) => (
    <Item i={index} data={itemData} key={rec.id} />
  ));
}

ItemsList.displayName = "ItemsList";
