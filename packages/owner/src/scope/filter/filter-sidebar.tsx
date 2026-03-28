import React from "react";
import {
  deepEqual,
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  EMPTY_RECORD,
  i18n,
  type Container,
  type ListViewBlock,
  type Widget,
} from "~/utils";
import {
  convertValues,
  getFilterForEvent,
  getItemFieldType,
  toggleFilterValue,
} from "./widgets/utils";
import {
  getDefaults,
  type FilterField,
  type FilterFieldDateOptions,
  type FilterFieldOptions,
  type FilterFieldRelation,
  type FilterGroup,
  type FilterWidget,
  type NodeSearchFilterField,
} from "~/utils/filter";
import type { FilterProps } from "./types";
import {
  DateFilter,
  GroupFilter,
  M2OFilter,
  SelectFilter,
  TreeFilter,
} from "./widgets";
import { Collapse, Dialog, Drawer, Stack, Text, useLazyRef } from "@funext/ui";
import { FilterTag } from "./widgets/item-filter";
import { useResourceContext, useViewContext } from "~/context";
const panelProps = {
  sx: {
    minWidth: 300,
  },
};
export function FilterSidebar({ mode }: { mode?: "list" | "drawer" | "tags" }) {
  //const [filter, setFilter] = React.useState<Record<string, any>>({});
  const viewContext = useViewContext<ListViewBlock>();
  const { modifiers, query } = useResourceContext();
  const {
    filterSidebar: container,
    //query,
    //modifiers,
    dataStore,
    sideOpen,
    setSideOpen,
    filterDefaults,
    search,
  } = viewContext;

  const hasRef = React.useRef(false);

  const items = React.useMemo(
    () =>
      container?.items?.filter(
        (item) =>
          !!item.name &&
          [
            "group",
            "select",
            "mto",
            "m2m",
            "date",
            "datetime",
            "node",
          ].includes(item.widget!),
      ),
    [container],
  );

  const setFilter = React.useCallback(
    (data?: any) => {
      hasRef.current = true;
      modifiers?.updateFilters?.(data);
    },
    [modifiers?.updateFilters],
  );

  React.useEffect(() => {
    if (hasRef.current) {
      const tm = setTimeout(() => {
        hasRef.current = false;
        console.log("FilterSidebar: filter:", query?.filter);
        search?.();
      }, 1000);
      return () => clearTimeout(tm);
    }
  }, [query?.filter, search]);

  if (!items) {
    return null;
  }

  if (mode === "drawer") {
    return (
      <Drawer
        open={sideOpen}
        onOpenChange={(open: boolean, event:Event, reasons:any) => {
          setSideOpen(open);
          console.log("DialogContent onOpenChange: event:", event,", reasons:", reasons )
        }}
        direction="end"
        strategy="fixed"
        panelProps={panelProps}
        keep
      >
        <Dialog.Header onClose={() => setSideOpen(false)} className="p-2">
          <Text variant="h6">{i18n.t("Filter")}</Text>
        </Dialog.Header>
        <Dialog.Body className="px-1">
          <Stack className="gap-3">
            <Sidebar
              mode="list"
              items={items}
              values={query?.filter ?? EMPTY_RECORD}
              setFilter={setFilter}
              defaults={filterDefaults}
            />
          </Stack>
        </Dialog.Body>
      </Drawer>
    );
  }

  if (mode === "list") {
    return (
      <Stack className="overflow-auto gap-2 ">
        <Sidebar
          mode="list"
          items={items}
          values={query?.filter ?? EMPTY_RECORD}
          setFilter={setFilter}
          defaults={filterDefaults}
        />
      </Stack>
    );
  }

  return (
    <Collapse open={sideOpen}>
      <div
        dat-ui="FilterSidebarTags"
        className="flex flex-row no-wrap p-1 my-2 overflow-auto gap-2"
      >
        <Sidebar
          mode="tags"
          items={items}
          values={query?.filter ?? EMPTY_RECORD}
          setFilter={setFilter}
          defaults={filterDefaults}
        />
      </div>
    </Collapse>
  );
}

type Props = {
  items: FilterWidget[];
  values?: Record<string, any>;
  setFilter: (values: Record<string, any>) => void;
  mode?: "list" | "tags";
  defaults?: any;
};

export function Sidebar({
  items,
  values: initValues,
  setFilter,
  defaults,
  mode = "list",
}: Props) {
  const [values, setValues] = React.useState({} as any);
  const [active, setActive] = React.useState(false);

  const [hasFilter, setHasFilter] = React.useState(false);

  const defaultValues = useLazyRef(() => {
    if (!defaults) {
      return {};
    }
    const names = items.map((it) => it.name);

    const all = items.reduce(
      (prev, item) => (prev[item.name!] = item) && prev,
      {} as any,
    );
    const defValues = Object.keys(defaults)
      .filter((key) => names.includes(key) && defaults[key] != null)
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
    console.log("FilterSidebar: initValues:", initValues);
    const names = items.map((it) => it.name);

    const all = items.reduce(
      (prev, item) => (prev[item.name!] = item) && prev,
      {} as any,
    );
    let values = { ...initValues };
    const newValues = Object.keys(values)
      .filter((key) => names.includes(key) && values[key] != null)
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

    setValues((prev: any) => {
      console.log(
        "FilterSidebar: setValues ggg:",
        deepEqual(values, prev) ? prev : values,
      );
      return deepEqual(values, prev) ? prev : values;
    });
  }, [items, initValues, defaultValues.current]);

  //React.useEffect(() => setFilter(values), [values])

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
      setValues((oldValues: any) => {
        const newValues = getFilterForEvent(event, oldValues, items as any);
        console.log(
          "FilterSidebar:: onChange: oldValues:",
          oldValues,
          ", newValues:",
          newValues,
        );
        if (newValues && oldValues !== newValues) {
          setTimeout(() => setFilter(newValues), 200);

          return newValues;
        }
        return oldValues;
      });
    },
    [items, setFilter, setValues],
  );

  const [opens, setOpens] = React.useState(EMPTY_ARRAY);

  const toggleOpen = React.useCallback((name: string) => {
    setOpens((openings) =>
      openings.includes(name)
        ? openings.filter((key) => key !== name)
        : [...openings, name],
    );
  }, []);

  const Component = mode === "list" ? FilterComponent : TagComponent;

  return React.useMemo(
    () =>
      items.map((item, index) => (
        <Component
          item={item as FilterProps<FilterGroup | FilterField>["item"]}
          toggleOpen={toggleOpen}
          isOpen={opens.includes(item.name!)}
          onChange={onChange}
          value={values[item.name!]}
          divider={index > 0}
          key={index}
        />
      )),
    [values, items, mode, onChange, toggleOpen, opens],
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
      return <DateFilter {...(props as FilterProps<FilterFieldDateOptions>)} />;
    case "m2o":
    case "m2m":
      return <M2OFilter {...(props as FilterProps<FilterFieldRelation>)} />;
    case "select":
      return <SelectFilter {...(props as FilterProps<FilterFieldOptions>)} />;
  }

  return null;
});

const TagComponent = React.memo(function TagComponent(
  {divider, ...props}: FilterProps<FilterGroup | FilterField>,
) {
  return (
    <FilterTag
      {...props}
      renderFilter={(options) => <FilterComponent {...options} />}
    />
  );
});
