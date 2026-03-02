import { List } from "@funext/ui";
import { useMemo } from "react";
import { ItemFilter, ItemFilterHeader } from "./item-filter";
import { EMPTY_ARRAY, getWidgetProp, i18n , type Option} from "~/utils";
import type { FilterFieldOptions } from "~/utils/filter";
import type { FilterProps, OnFilterChange } from "../types";


export const DATE_RANGES = {
    'today': 'Today',
    
    'this_week': 'This Week',
    'this_month': 'This Month',
    'this_quarter': 'This Quarter',
    'this_year': 'This Year',
    
    'last_day': 'Yesterday',
    'last_week': 'This Week',
    'last_month': 'This Month',
    'last_quarter': 'This Quarter',
    'last_year': 'This Year',
    'custom': 'Custom'
}


const getCurrenSelection: () => Option[] = () => [
  { name: "today", title: i18n.get("Today") },
  { name: "this_week", title: i18n.get("This Week") },
  { name: "this_month", title: i18n.get("This Month") },
  { name: "this_quarter", title: i18n.get("This Quarter") },
  { name: "this_year", title: i18n.get("This Year") },
];

const getPastSelection: () => Option[] = () => [
  { name: "last_day", title: i18n.get("Yesterday") },
  { name: "last_week", title: i18n.get("Last Week") },
  { name: "last_month", title: i18n.get("Last Month") },
  { name: "last_quarter", title: i18n.get("Last Quarter") },
  { name: "last_year", title: i18n.get("Last Year") },
];

const getNextSelection: () => Option[] = () => [
  { name: "next_day", title: i18n.get("Tomorrow") },
  { name: "next_week", title: i18n.get("Next Week") },
  { name: "next_month", title: i18n.get("Next Month") },
  { name: "next_quarter", title: i18n.get("Next Quarter") },
  { name: "next_year", title: i18n.get("Next Year") },
];

function useDateSelection({ options, name }: FilterFieldOptions) {
  return useMemo(() => {
    const selectionArray: Option[] = [];
    options?.forEach((v) => {
      switch (v.value) {
        case "current":
          selectionArray.push(...getCurrenSelection());
          break;
        case "last":
          selectionArray.push(...getPastSelection());
          break;
        case "next":
          selectionArray.push(...getNextSelection());
          break;
      }
    });
    return selectionArray;
  }, EMPTY_ARRAY);
}

export function DateFilter({
  item,
  onChange,
  value
}: FilterProps<FilterFieldOptions>) {
  //const { title, value, } = item;

  const selections = useDateSelection(item);

  return (
    <List className="w-full" data-list="" data-filter-key={item.name}>
      <ItemFilterHeader
        icon={getWidgetProp(item.props, "icon")}
        title={item.title}
        type={item.type}
        pType={item.pType ?? "date"} 
      />
      {selections.map((option, index) => (
        <ItemFilter
          key={`filter_${index}`}
          value={option.value}
          selected={option.value === value}
          title={option.title}
          onClick={onChange}
        />
      ))}
    </List>
  );
}
