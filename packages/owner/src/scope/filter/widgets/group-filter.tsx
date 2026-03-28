import { List } from "@funext/ui";

import { ItemFilter, ItemFilterHeader } from "./item-filter";
import {
  EMPTY_ARRAY,
  getWidgetProp
} from "~/utils";
import { type FilterGroup } from "~/utils/filter";
import type { FilterProps } from "../types";

export function GroupFilter({
  item,
  onChange,
  value,
  divider,
  ...props
}: FilterProps<FilterGroup>) {
  const { items, multiple = false } = item;
  //const checkedCount = selected.length;
  const values = multiple && Array.isArray(value) ? value : EMPTY_ARRAY;

  if (items?.length) {
    return (
      <List data-ui="FilterItemList" className={`w-full flex-1 ${divider ? 'border-t-1 pt-2': ''}`} data-list="" data-filter_key={item.name}>
        <ItemFilterHeader
          icon={getWidgetProp(item.props, "icon")}
          title={item.title ?? item.name}
          type={item.type}
        />
        {items!.map((filter, index) => (
          <ItemFilter
            key={`filter_${index}`}
            value={filter.value ?? (filter as any).name}
            selected={
              multiple
                ? values.includes(filter.value)
                : value === (filter.value ?? (filter as any).name)
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
