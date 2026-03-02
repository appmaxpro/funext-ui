import { List } from "@funext/ui";
import { useEffect, useMemo } from "react";

import { getFilterValue, toggleFilterValue } from "./utils";
import { ItemFilter, ItemFilterHeader } from "./item-filter";
import { type SearchFilterField, type Option, getWidgetProp, EMPTY_ARRAY } from "~/utils";
import { useSimpleSelectionList } from "../../widgets/select";
import type { FilterFieldOptions } from "~/utils/filter";
import type { FilterProps, OnFilterChange } from "../types";

export function SelectFilter({
  item,
  onChange,
  value,
  ...props
  }: FilterProps<FilterFieldOptions>) {
  const schema = item;
  const { multiple } = item;

  const selectionList = useSimpleSelectionList(schema);

  if(!selectionList?.length)
    return null;
  
  const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;

  return (
    <List {...props} className="w-full" data-list="" data-filter-key={item.name}>
      <ItemFilterHeader
        icon={getWidgetProp(item.props, "icon")}
        title={item.title}
        type={item.type}
        pType={item.pType}
      />
      {selectionList?.map((option, index) => (
        <ItemFilter
          key={`filter_${index}`}
          value={option.value}
          selected={multiple ? values.includes(option.value) : option.value === value}
          title={option.title}
          onClick={onChange}
        />
      ))}
    </List>
  );
}
