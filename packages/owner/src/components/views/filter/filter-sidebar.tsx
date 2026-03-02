import React from "react";
import { deepEqual, EMPTY_ARRAY, EMPTY_RECORD, type Container } from "~/utils";
import {
  convertValues,
  getItemFieldType,
  toggleFilterValue,
} from "./widgets/utils";
import type {
  FilterField,
  FilterFieldOptions,
  FilterFieldRelation,
  FilterGroup,
  NodeSearchFilterField,
} from "~/utils/filter";
import type { FilterProps } from "./types";
import {
  DateFilter,
  GroupFilter,
  M2OFilter,
  SelectFilter,
  TreeFilter,
} from "./widgets";
import { useLazyRef } from "@funext/ui";

type Props = {
  container: Container;
  values?: Record<string, any>;
  defaults?: Record<string, any>;
  setFilter: (values: Record<string, any>) => void;
};
export function FilterSidebar({
  container,
  defaults,
  values: initValues,
  setFilter,
}: Props) {
  const items = React.useMemo(
    () =>
      container.items!.filter(
        (item) =>
          !!item.name &&
         ["group", "m2o", "m2m", "date", "datetime", "node"].includes(item.widget!),
      ),
    [container],
  );

  const [values, setValues] = React.useState({} as any);
  const [active, setActive] = React.useState(false);

  const [hasFilter, setHasFilter] = React.useState(false);

  const defaultValues = useLazyRef(() => {
    if (!defaults) {
      return {};
    }
    const all = items.reduce(
      (prev, item) => (prev[item.name!] = item),
      {} as any,
    );
    const defValues = Object.keys(defaults)
      .filter((key) => defaults[key] != null && key in all)
      .reduce(
        (prev, key) =>
          (prev[key] =
            convertValues(defaults[key], all[key].pType, all[key].multiple) ||
            1) && prev,
        {} as any,
      );

    return defValues;
  });

  React.useEffect(() => {
    const all = items.reduce(
      (prev, item) => (prev[item.name!] = item),
      {} as any,
    );

    let values = { ...initValues };
    const newValues = Object.keys(values)
      .filter((key) => values[key] != null && key in all)
      .reduce(
        (prev, key) =>
          (prev[key] =
            convertValues(values[key], all[key].pType, all[key].multiple) ||
            1) && prev,
        {} as any,
      );

    setActive(Object.keys(newValues).length > 0);
    values = { ...defaultValues.current, ...newValues };
    setHasFilter(false);

    setValues((prev: any) => (deepEqual(values, prev) ? prev : values));
  }, [items, initValues, defaultValues.current]);

  const restore = React.useCallback(() => {
    const defaults = defaultValues.current;

    const reset = items
      .map((i) => i.name!)
      .filter((k) => values[k] != null)
      .filter((k) => !deepEqual(defaults[k], values[k]))
      .reduce((prev, key) => (prev[key] = defaults[key] ?? null), {} as any);

    setHasFilter(false);
    setFilter(reset);
  }, [values, setFilter, setHasFilter]);

  const apply = React.useCallback(() => {
    setHasFilter(false);
    setFilter(values);
  }, [values, setFilter]);

  const onChange = React.useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      const value = target.dataset["value"];

      const list = target.closest('[data-list=""]') as HTMLElement;

      if (list) {
        const filterKey = list.dataset["filter-key"];
        if (filterKey) {
          const filter = items.find((item) => item.name === filterKey);
          if (filter) {
            setValues((values: any) => {
              const multiple = "multiple" in filter ? !!filter.multiple : false;
              const newValue = toggleFilterValue(
                value,
                values[filterKey],
                multiple,
              );
              const newValues = { ...values, [filterKey]: newValue };
              const hasFilter = !deepEqual(newValues, values);

              setHasFilter(hasFilter);

              return hasFilter ? newValues : values;
            });
          }
        }
      }
    },
    [items],
  );

  const [opens, setOpens] = React.useState(EMPTY_ARRAY);

  const toggleOpen = React.useCallback((name: string) => {
    setOpens((openings) =>
      openings.includes(name)
        ? openings.filter((key) => key !== name)
        : [...openings, name],
    );
  }, []);

  return React.useMemo(
    () =>
      items.map((item, index) => (
        <FilterComponent
          item={item as FilterProps<FilterGroup | FilterField>["item"]}
          toggleOpen={toggleOpen}
          isOpen={opens.includes(item.name!)}
          onChange={onChange}
          value={values[item.name!]}
          key={index}
        />
      )),
    [values, items],
  );
}

const FilterComponent = React.memo(function FilterComponent(
  props: FilterProps<FilterGroup | FilterField>,
) {
  const { item } = props;

  if (item.widget === "group") {
    return <GroupFilter {...(props as FilterProps<FilterGroup>)} />;
  }
  if (item.widget === "node") {
    return <TreeFilter {...(props as FilterProps<NodeSearchFilterField>)} />;
  }

  const type = getItemFieldType(item as any);

  switch (type) {
    case "date":
    case "datetime":
      return <DateFilter {...(props as FilterProps<FilterFieldOptions>)} />;
    case "m2o":
    case "m2m":
      return <M2OFilter {...(props as FilterProps<FilterFieldRelation>)} />;
    case "select":
      return <SelectFilter {...(props as FilterProps<FilterFieldOptions>)} />;
  }

  return null;
});
