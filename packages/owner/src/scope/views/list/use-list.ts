import type { VirtualScrollerInitialParams } from "@af-utils/virtual-core";
import React from "react";
import type { IndexRecord } from "~/scope";
import { useLazyRef } from "~/ui";
import { DataStore, EMPTY_ARRAY, type Block, type DataContext, type DataRecord, type Identifier, type ListViewBlock, type SearchOptions, type SearchResult } from "~/utils";

type Props = {
  doSearch(option?: SearchOptions | undefined):Promise<SearchResult>;
  dataStore: DataStore;
  estimatedItemSize?: number;
  fields?: string[]
};

export function useList({
  estimatedItemSize,
  dataStore,
  fields,
  doSearch,
}: Props) {

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
        const result = await doSearch({
          ...option,
          fields: fields,
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
          page: dataStore.page,
          records: dataStore.records,
        });
      } finally {
        pageRef.current.isLoading = false;
      }
    },
    [doSearch],
  );

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

  return {
    search,
    fetch,
    scroller, 
    status,
    records
  }

}