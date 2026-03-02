import { List } from "@funext/ui";

import { ItemFilter, ItemFilterHeader } from "./item-filter";
import {
  EMPTY_ARRAY,
  getWidgetProp,
  type SearchFilter,
  type SearchFilterGroup,
} from "~/utils";
import { isFilterChecked, type FilterGroup } from "~/utils/filter";
import type { FilterProps, OnFilterChange } from "../types";
import { toggleFilterValue } from "./utils";

export function GroupFilter({
  item,
  onChange,
  value,
  ...props
}: FilterProps<FilterGroup>) {
  const { items, multiple = false } = item;
  //const checkedCount = selected.length;
  const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;

  if (items?.length) {
    return (
      <List className="w-full" data-list="" data-filter-key={item.name}>
        <ItemFilterHeader
          icon={getWidgetProp(item.props, "icon")}
          title={item.title}
          type={item.type}
        />
        {items!.map((filter, index) => (
          <ItemFilter
            key={`filter_${index}`}
            value={filter.value ?? filter.name}
            selected={
              multiple
                ? values.includes(filter.value)
                : value === (filter.value ?? filter.name)
            }
            title={filter.title}
            onClick={onChange}
          />
        ))}
      </List>
    );
  }

  return null;
}
