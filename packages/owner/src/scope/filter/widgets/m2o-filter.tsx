
import { useEffect, useState } from "react";
import { ItemFilter, ItemFilterHeader, LoadMoreFilter } from "./item-filter";
import {
  List, useLazyRef
} from "@funext/ui";
import { DataStore, EMPTY_ARRAY, getWidgetProp, useOptionLabel, type Identifier } from "~/utils";
import type { FilterFieldRelation } from "~/utils/filter";
import type { FilterProps } from "../types";
import { useDataStore } from "~/hooks/use-data-store";
import { useEvalDomain } from "~/hooks/use-eval-domain";
import { useAsyncFetch } from "~/hooks/use-async-fetch";
import React from "react";

export function M2OFilter({
  item,
  onChange,
  value,
  divider,
  ...props
}: FilterProps<FilterFieldRelation> ) {
  const schema = item;
  const {
    orderBy:order,
    limit = 10,
    target,
    targetName,
    targetSearch,
    domain:domainGet,
    multiple
  } = item;
  const fetchingIdsRef = useLazyRef(()=> new Set<Identifier>());

  const getOptionLabel = useOptionLabel(schema);
  const [canFetch, setCanFetch] = useState(false);
  const domain = useEvalDomain(domainGet);

  const dataStore = useLazyRef(()=> new DataStore(target!, {domain , order, limit, infinite: true})).current

  const search = useDataStore({
    dataStore,
    targetName,
    targetSearch
  });

  const {isLoading, fetch, error, signal} = useAsyncFetch(search);
  
  useEffect(() => {
    fetch("");
  }, [fetch]);

  const isFetchingNextPage = dataStore.records.length && isLoading;
   
  useEffect(() => {
     const fetchingIds = fetchingIdsRef.current
     const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY; 
     const unWanted = Array.from(fetchingIds).filter(id=> !values.includes(id))
     unWanted.forEach(fetchingIds.add.bind(fetchingIds))

     const missing = dataStore.getMissing(values.filter(id=> !fetchingIds.has(id)) as Identifier[]);
     if (missing && missing.length) {
        fetch("", {domain: [['id', 'in', missing]], reset: false})
     }
  }, [value]);

  useEffect(() => {
    return dataStore.subscribe(()=> {
      const page = dataStore.page;
      setCanFetch((page.offset ?? 0) < (page.total ?? 0));

      const fetchingIds = fetchingIdsRef.current;
      if(!fetchingIds.size) return;
      const fetching = Array.from(fetchingIds);
      const missing = dataStore.getMissing(fetching);
      if(!missing.length) return;
      fetchingIds.clear();
      missing.forEach(fetchingIds.add.bind(fetchingIds));
    })
  },[dataStore]);

  const fetchNextPage = React.useCallback(async () => {
      fetch("", {
        offset: dataStore.nextOffset,
      });
    }, [fetch]);

  const refresh = React.useCallback(async () => {
      fetch("", {
        offset: 0,
      });
    }, [fetch]);

  //const values = getFilterValue(value, multiple);
  //const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;
    
  const items = dataStore.records;

  const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;
  if (!items.length) return null;
  

  return (
    <List data-ui="FilterItemList" {...props} className={`w-full flex-1 ${divider ? 'border-t-1 pt-2': ''}`} data-list="" data-filter_key={item.name}>
      <ItemFilterHeader
        icon={getWidgetProp(item.props, "icon")}
        title={item.title ?? item.name}
        type={item.type}
        pType={item.pType}
        className="container-hover"
        loading={isLoading}
        onRefresh={refresh}
      />

      {items.map((option, index) => (
        <ItemFilter
          key={`filter_${index}`}
          selected={multiple ? values.includes(option.id) : value === option.id}
          value={option.id}
          onClick={onChange}
          title={getOptionLabel(option)}
        />
      ))}
      {canFetch && !isFetchingNextPage && !isLoading  && (
        <LoadMoreFilter
          onClick={fetchNextPage}
        />
      )}
    </List>
  );
}
