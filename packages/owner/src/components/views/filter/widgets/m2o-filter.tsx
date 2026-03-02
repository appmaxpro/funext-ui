
import { useCallback, useEffect, useState } from "react";
import { getFilterValue, toggleFilterValue } from "./utils";
import { ItemFilter, ItemFilterHeader, LoadMoreFilter } from "./item-filter";
import {
  IconButton,
  List,
  Spinner,
  useIsMounted,
} from "@funext/ui";
import { useCompletion } from "~/hooks/use-completion";
import { EMPTY_ARRAY, getWidgetProp, i18n, useOptionLabel, type DataRecord, type Field, type Schema, type SearchFilterField, type SearchPage } from "~/utils";
import { useEvalBlockContext } from "../../block";
import type { FilterFieldRelation } from "~/utils/filter";
import type { FilterProps, OnFilterChange } from "../types";
import { Icons } from "~/components/other/icons";

export function M2OFilter({
  item,
  onChange,
  value,
  ...props
}: FilterProps<FilterFieldRelation> ) {
  const schema = item;
  const {  multiple } = item;
  const [hasSearchMore, setSearchMore] = useState(false);
  const ctx = useEvalBlockContext();
  const {
    orderBy,
    limit = 10,
    target,
    targetName,
    domain,
  } = item;

  const [items, setItems] = useState<DataRecord[]>([]);
  const [pager, setPager] = useState<SearchPage>(() => ({
    offset: 0,
    limit,
  }));
  const getOptionLabel = useOptionLabel(schema);
  const [loading, setLoading] = useState(false);
  const isMounted = useIsMounted();
  const search = useCompletion({
    sortBy: orderBy,
    limit,
    target: target!,
    targetName,
  });

  const fetchOptions = useCallback(
    async (text: string, more: boolean = false) => {
      if (!isMounted) return;

      let pager: SearchPage;
      async function load() {
        try {
          setLoading(true);
          const { records, page } = await search(text, {
            _domain: domain as any,
            offset: more ? pager.offset : undefined,
          });

          if (!isMounted) return;

          const totalCount = page.total ?? 0;
          const offset = more ? (pager.offset ?? 0) : 0;
          const recordLength = records?.length ?? 0;

          setSearchMore(totalCount > offset + recordLength);
          //@ts-ignore 
          setPager((last) => {
            const newPager = {
              ...last,
              offset: records.length + (more ? last.offset ?? 0 : 0),
            };
            return newPager;
          });

          setItems((items) => {
            return more ? [...items, ...records] : records;
          });
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      //@ts-ignore
      setPager((lastPager) => {
        pager = lastPager;
        load();
        return lastPager;
      });
    },
    [search, domain, setPager, isMounted],
  );

  useEffect(() => {
    console.log("NewPager:", pager);
  }, [pager]);

  useEffect(() => {
    fetchOptions("");
  }, [fetchOptions]);

  //const values = getFilterValue(value, multiple);
  //const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;
  
  if (!items || !items.length) return null;

  const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;

  const loadMore = useCallback(() => fetchOptions("", true), [fetchOptions])

  return (
    <List {...props} className="w-full" data-list="" data-filter-key={item.name}>
      <ItemFilterHeader
        icon={getWidgetProp(item.props, "icon")}
        title={item.title}
        type={item.type}
        pType={item.pType}
        className="container-hover"
        loading={loading}
        onRefresh={() => fetchOptions("")}
      />

      {items?.map((option, index) => (
        <ItemFilter
          key={`filter_${index}`}
          selected={multiple ? values.includes(option.id) : value === option.id}
          value={option.id}
          onClick={onChange}
          title={getOptionLabel(option)}
        />
      ))}
      {hasSearchMore && !loading && (
        <ItemFilter
          onClick={loadMore}
          value={""}
          title={i18n.get("Load More")}
          startIcon={<Icons.ChevronDown/>}
        />
      )}
    </List>
  );
}
