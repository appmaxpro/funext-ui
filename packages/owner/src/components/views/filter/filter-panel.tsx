
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Chip,
  Accordion,
  Icon,
  IconButton,
  useTheme,
  useScreenSize,
  List,
  clsx,
  Text,
  getScrollClasses,
} from "@funext/ui";



import { focusAtom } from "@/utils/atoms";
import { TreeFilter } from "./widgets/tree-filter";
import { DateFilter, GroupFilter, M2OFilter, SelectFilter } from "./widgets";
import { getItemFieldType } from "./widgets/utils";
import { i18n, type DataStore, type NodeSearchFilterField, type SearchFilter, type SearchFilterField, type SearchFilterGroup, type SearchFilterPanel, type SearchFilterPanel, type SearchOptions, type SearchResult, type SelectSearchFilterField } from "~/utils";
import { prepareAdvanceSearchQuery } from "../utils";
import type { FilterField, FilterGroup, SidebarFilter } from "~/utils/filter";

interface FilterValue {
  item: SearchFilterGroup | SearchFilterField;
  states?: any;
  filter?: SearchFilter;
}
export interface FilterPanelProps {
  dataStore: DataStore;
  stateAtom: AdvancedSearchAtom;
  onSearch: (options?: SearchOptions) => Promise<SearchResult | undefined>;
  border?: boolean;
}

export function AdvanceFilterPanel({
  stateAtom,
  toolbar,
  large,
  ...others
}: AdvanceSearchProps & { toolbar?: boolean, border?: boolean; large?: boolean}) {
  const { filterPanel } = useAtomValue(stateAtom);

  if ((!filterPanel || !filterPanel.items || !filterPanel.items.length) && toolbar) {
    return <AdvanceSearch stateAtom={stateAtom} {...others} />;
  }

  if (filterPanel && !toolbar) {
    return <FilterPanel stateAtom={stateAtom} large={large} {...others} />;
  }

  return null;
}

export function FilterPanel({
  dataStore,
  stateAtom,
  onSearch,
  border,
  large,
  ...others
}: AdvanceSearchProps & {border?: boolean, large?: boolean}) {

  const [valueChange, setValueChange] = useState(0);
  const [stateChange, setStateChange] = useState(0);

  const [open, setOpen] = useState(false);

  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  const fields = useMemo(()=> selectAtom(stateAtom, (o)=> o.fields), [stateAtom])
  
  const [filterPanel, setFilterPanel] = useAtom(
    useMemo(
      () =>
        focusAtom(
          stateAtom,
          (o) => o.filterPanel,
          (o, v) => ({ ...o, filterPanel: v }),
        ),
      [stateAtom],
    ),
  );

  const [domains, setDomains] = useAtom(
    useMemo(
      () =>
        focusAtom(
          stateAtom,
          (o) => o.domains,
          (o, v) => ({ ...o, domains: v }),
        ),
      [stateAtom],
    ),
  );

  const handleApply = useAtomCallback(
    useCallback(
      (get, set) => {
        const state = get(stateAtom);
        set(stateAtom, prepareAdvanceSearchQuery(state as any, true) as any);
        onSearch?.();
      },
      [stateAtom, onSearch],
    ),
  );

  const onFilterChange = useCallback(
    ({ item, filter, states }: FilterValue) => {
      const items = filterPanel!.items;
      const index = items.findIndex((filterItem) => filterItem === item);

      if (item?.type === "filters") {
        const checked = !filter?.checked;
        const changeFilters = (filters: SearchFilter[]) => {
          if (!checked || item.multiple) {
            return filters;
          }
          return filters.map((filter) =>
            !filter.checked ? filter : { ...filter, checked: false },
          );
        };

        const fIndex = item.items!.findIndex((item) => item === filter);

        const newFilters = [
          ...changeFilters(item.items!.slice(0, fIndex)),
          { ...filter, checked },
          ...changeFilters(item.items!.slice(fIndex + 1)),
        ];

        const newItems = [
          ...items.slice(0, index),
          { ...item, items: newFilters },
          ...items.slice(index + 1),
        ];
        setFilterPanel(
          (filterPanel) =>
            ({ ...filterPanel, items: newItems }) as SearchFilterPanel,
        );
        setValueChange((value) => value + 1);
      } else {
        const { value: oldValue, state: oldState } = item as SearchFilterField;
        const { value: newValue = oldValue, state: newState = oldState } =
          states || {};
        const valueChange = oldValue != newValue;
        const stateChange = oldState != newState;

        const newItems = [
          ...items.slice(0, index),
          { ...item, ...states },
          ...items.slice(index + 1),
        ];
        setFilterPanel(
          (filterPanel) =>
            ({ ...filterPanel, items: newItems }) as SearchFilterPanel,
        );
        setValueChange((value) => (valueChange ? value + 1 : value));
        setStateChange((value) => (stateChange ? value + 1 : value));
      }
    },
    [filterPanel],
  );

  useEffect(() => {
    if (filterPanel) {
      const openState = filterPanel.items.reduce(
        (prev, item) => ({ ...prev, [item.uid]: true }),
        {},
      );
      setOpenState(openState);
    }
  }, [!filterPanel?.uid]);

  useEffect(() => {
    if(valueChange) {

    }
  }, [valueChange]);

  if (!filterPanel || !filterPanel.items || !filterPanel.items!.length) {
    return null;
  }

  //filterPanel.items?,

  const checkedCount = 0;

  const body = (
    <>
      {filterPanel.items.map((item) => (
        <FilterComponent
          key={item.uid}
          item={item}
          openState={openState}
          setOpenState={setOpenState}
          onFilterChange={onFilterChange}
        />
      ))}
    </>
  );


  const scrollClasses = useMemo(
    () => getScrollClasses({ overflowX: true }),
    [],
  );

  if (large) {
    return (
      <div
        style={{
          //@ts-ignore
          "--tw-border-color-rgb": "var(--tw-hd-md-rgb)",
        }}
        
        className={clsx("pt-2 w-1/3	max-w-60 max-h-full overflow-hidden border-t flex flex-col gap-2 text-sm", border && "border-e")}
      >
        <div className="w-full px-2 pt-2 ">
          <AdvanceSearch
            stateAtom={stateAtom}
            dataStore={dataStore}
            onSearch={onSearch}
            {...others}
          />
        </div>
        <div className={clsx(scrollClasses, "w-full flex flex-col divide-y")}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="w-full px-2 py-4 flex justify-center">
        <AdvanceSearch
          stateAtom={stateAtom}
          dataStore={dataStore}
          onSearch={onSearch}
          {...others}
        />
      </div>
      <Accordion open={open ?? false} className="w-full px-2 text-sm">
        <Accordion.Header
          onClick={() => setOpen(!open)}
          className="justify-between px-1 py-1"
          showIcon
        >
          <Box d="flex" alignItems="center">
            <MaterialIcon icon="filter_list" size={24} />
            <Text noWrap fw="bold" className="px-1 text-sm">
              {i18n.get("Filters")}
            </Text>

            {checkedCount > 0 ? (
              <Chip
                label={`${checkedCount}`}
                className="rounded-full"
                variant="ghost"
                size="sm"
              />
            ) : null}
          </Box>
        </Accordion.Header>
        <Accordion.Body className="px-1 py-1 overflow-y-auto max-h-[50%] divide-y">
          {body}
        </Accordion.Body>
      </Accordion>
    </div>
  );
}

interface FilterComponentProps {
  item: FilterGroup|FilterField;
  setOpenState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  openState: Record<string, boolean>;
  onFilterChange: (value: FilterValue) => void;
}

function FilterComponent({
  item,
  setOpenState,
  openState,
  onFilterChange,
}: FilterComponentProps) {
  if (item.widget === "group") {
    return (
      <GroupFilter
        item={item}
        onChange={({ states, filter }) =>
          onFilterChange({ item, filter, states })
        }
      />
    );
  }
  if (item.type === "node") {
    return (
      <TreeFilter
        item={item as NodeSearchFilterField}
        onChange={(states) => onFilterChange({ item, states })}
      />
    );
  }

  const type = getItemFieldType(item as any);

  switch (type) {
    case "date":
    case "datetime":
      return (
        <DateFilter
          item={item as SearchFilterField}
          onChange={(states) => onFilterChange({ item, states })}
        />
      );
    case "m2o":
    case "m2m":
      return <M2OFilter
        item={item as SelectSearchFilterField}
        onChange={(states) => onFilterChange({ item, states })}
    />
    case "enum":
      return (
        <SelectFilter
          item={item as SelectSearchFilterField}
          onChange={(states) => onFilterChange({ item, states })}
        />
      );

  }


  return null;
}
