import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

import { Button, Checkbox, cn, debounce, Dialog } from "@funext/ui";

import React, { useEffect, useState } from "react";
import { i18n, type DataStore } from "~/utils";
import { useDataStore } from "~/hooks/use-data-store";
import { useAsyncFetch } from "~/hooks/use-async-fetch";
import {
  DynamicPopup,
  Popup,
  type Display,
  type DynamicDisplay,
  type PopupProps,
  type PopupSlots,
  type RenderOptions,
  type TriggerAction,
} from "./popup";
import { Icons } from "./icons";
import { Items } from "./items";
import { noop } from "lodash";

export interface RelationSelectorConfig<T = any> {
  /** The GraphQL query document for fetching items */
  dataStore: DataStore;
  /** The property key for the entity ID */
  idKey: keyof T;
  /** The property key for the display label */
  labelKey: keyof T;
  /** Number of items to load per page */
  pageSize?: number;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether to enable multi-select mode */
  multiple?: boolean;

  /** Custom label renderer function for rich display */
  label?: (item: T) => React.ReactNode;

  targetName?: string;
  targetSearch?: string[];
  display?: Display | DynamicDisplay;
  slots?: PopupSlots;
  popupTitle?: React.ReactNode;
}

export interface RelationSelectorProps<T = any> {
  config: RelationSelectorConfig<T>;
  /**
   * @description
   * The label for the selector trigger. Default is
   * "Select item" for single select and "Select items" for multi select.
   */
  selectorLabel?: React.ReactNode;
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export interface RelationSelectorItemProps<T = any> {
  item: T;
  config: RelationSelectorConfig<T>;
  isSelected: boolean;
  onSelect: () => void;
  showCheckbox?: boolean;
}

/**
 * Abstract relation selector item component
 */
export function RelationSelectorItem<T>({
  item,
  config,
  isSelected,
  onSelect,
  showCheckbox = false,
}: Readonly<RelationSelectorItemProps<T>>) {
  const id = String(item[config.idKey]);
  const label = config.label
    ? config.label(item)
    : String(item[config.labelKey]);

  return (
    <CommandItem
      key={id}
      value={id}
      onSelect={onSelect}
      className="flex items-center gap-2"
    >
      {showCheckbox && (
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      )}
      { !showCheckbox ? isSelected ? <Icons.Check className="h-4 w-4" /> : <Icons.Blank className="h-4 w-4" /> : null}
      <span className="flex-1">{label}</span>
    </CommandItem>
  );
}

/**
 * Hook for managing relation selector state and queries
 */
export function useRelationSelector<T>(config: RelationSelectorConfig<T>) {
  const { dataStore: dataSource, targetName, targetSearch } = config;

  const dataSearch = useDataStore({
    dataStore: dataSource,
    targetName,
    targetSearch,
  });

  const { fetch, error, state } = useAsyncFetch(dataSearch);

  const fetcher = fetch;

  // Function to fetch items by IDs
  const fetchItemsByIds = React.useCallback(
    async (ids: string[]): Promise<T[]> => {
      if (ids.length === 0) return [];

      const data = await fetcher("", {
        offset: 0,
        domain: [["id", "in", ids]],
        limit: ids.length,
        reset: false,
      });

      return data.records as T[];
    },
    [],
  );

  return {
    isLoading: state === "loading",
    fetcher,
    error,
    fetchItemsByIds,
  };
}

/**
 * Abstract relation selector component
 */
export function RelationSelector<T>({
  config,
  value,
  onChange,
  disabled,
  className,
  selectorLabel,
}: Readonly<RelationSelectorProps<T>>) {
  const [selectedItemsCache, setSelectedItemsCache] = useState<T[]>([]);
  const fetchedIdsRef = React.useRef<Set<string>>(new Set());
  const fetchingIdsRef = React.useRef<Set<string>>(new Set());
  const searchDebounceRef = React.useRef(debounce);

  const dataStore = config.dataStore;

  const isMultiple = config.multiple ?? false;
  const [searchTerm, setSearchTerm] = useState("");

  const { isLoading, fetcher, fetchItemsByIds } = useRelationSelector(config);

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    return dataStore.subscribe(() => {
      setCounter((old) => old + 1);
    });
  }, [dataStore]);

  const search = React.useCallback(
    (term: string) => {
      setSearchTerm(term);
      searchDebounceRef.current(() => fetcher(term), 300);
    },
    [fetcher],
  );

  // Store a stable reference to fetchItemsByIds
  const fetchItemsByIdsRef = React.useRef(fetchItemsByIds);
  fetchItemsByIdsRef.current = fetchItemsByIds;

  const [items, pager, hasNextPage] = React.useMemo(() => {
    const pager = dataStore.page;
    return [
      dataStore.records as T[],
      pager,
      (pager.page ?? 1) < (pager.pages ?? 0),
    ];
  }, [counter]);

  const fetchNextPage = React.useCallback(async () => {
    fetcher(searchTerm, {
      offset: dataStore.nextOffset,
    });
  }, [fetcher, pager, searchTerm]);

  // Normalize value to always be an array for easier handling
  const selectedIds = React.useMemo(() => {
    if (isMultiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    // For single select, ensure we only have at most one ID
    const singleValue = Array.isArray(value) ? value[0] : value;
    return singleValue ? [String(singleValue)] : [];
  }, [value, isMultiple]);

  const isFetchingNextPage = items?.length && isLoading;

  // Fetch selected items by IDs on mount and when selectedIds change
  React.useEffect(() => {
    const fetchSelectedItems = async () => {
      if (selectedIds.length === 0) {
        setSelectedItemsCache([]);
        fetchedIdsRef.current.clear();
        fetchingIdsRef.current.clear();
        return;
      }

      // Find which selected IDs we haven't fetched yet and aren't currently fetching
      const missingIds = selectedIds.filter(
        (id) =>
          !fetchedIdsRef.current.has(id) && !fetchingIdsRef.current.has(id),
      );

      if (missingIds.length > 0) {
        // Mark these IDs as being fetched
        missingIds.forEach((id) => fetchingIdsRef.current.add(id));

        try {
          const fetchedItems = await fetchItemsByIdsRef.current(missingIds);

          // Mark these IDs as fetched and remove from fetching
          missingIds.forEach((id) => {
            fetchedIdsRef.current.add(id);
            fetchingIdsRef.current.delete(id);
          });

          setSelectedItemsCache((prev) => {
            if (!isMultiple) {
              // For single select, replace the entire cache
              return fetchedItems;
            }
            // For multi-select, filter and append
            const stillSelected = prev.filter((item) =>
              selectedIds.includes(String(item[config.idKey])),
            );
            return [...stillSelected, ...fetchedItems];
          });
        } catch (error) {
          // Remove from fetching set on error
          missingIds.forEach((id) => fetchingIdsRef.current.delete(id));
          console.error("Error fetching items by IDs:", error);
        }
      } else {
        // Just filter out items that are no longer selected
        setSelectedItemsCache((prev) => {
          if (!isMultiple) {
            // For single select, if no items need fetching but we have a selection,
            // keep only items that are in the current selection
            return prev.filter((item) =>
              selectedIds.includes(String(item[config.idKey])),
            );
          }
          // For multi-select, normal filtering
          return prev.filter((item) =>
            selectedIds.includes(String(item[config.idKey])),
          );
        });
      }

      // Clean up fetched IDs that are no longer selected
      const selectedIdsSet = new Set(selectedIds);
      for (const fetchedId of fetchedIdsRef.current) {
        if (!selectedIdsSet.has(fetchedId)) {
          fetchedIdsRef.current.delete(fetchedId);
        }
      }
    };

    fetchSelectedItems();
  }, [selectedIds, config.idKey, isMultiple]);

  const handleSelect = (item: T, close: RenderOptions['close']) => {
    const itemId = String(item[config.idKey]);

    if (isMultiple) {
      const isCurrentlySelected = selectedIds.includes(itemId);
      const newSelectedIds = isCurrentlySelected
        ? selectedIds.filter((id) => id !== itemId)
        : [...selectedIds, itemId];

      // Update cache: add item if selecting, remove if deselecting
      setSelectedItemsCache((prev) => {
        if (isCurrentlySelected) {
          return prev.filter(
            (prevItem) => String(prevItem[config.idKey]) !== itemId,
          );
        } else {
          // Only add if not already in cache
          const alreadyInCache = prev.some(
            (prevItem) => String(prevItem[config.idKey]) === itemId,
          );
          return alreadyInCache ? prev : [...prev, item];
        }
      });

      // Mark the item as fetched to prevent duplicate fetching
      if (!isCurrentlySelected) {
        fetchedIdsRef.current.add(itemId);
      } else {
        fetchedIdsRef.current.delete(itemId);
      }

      onChange(newSelectedIds);
    } else {
      // For single select, update cache with the new item
      setSelectedItemsCache([item]);
      // Mark as fetched for single select too
      fetchedIdsRef.current.clear();
      fetchedIdsRef.current.add(itemId);
      onChange(itemId);
      close();
      setSearchTerm("");
    }
  };

  const handleRemove = (itemId: string) => {
    if (isMultiple) {
      const newSelectedIds = selectedIds.filter((id) => id !== itemId);
      // Remove from cache as well
      setSelectedItemsCache((prev) =>
        prev.filter((prevItem) => String(prevItem[config.idKey]) !== itemId),
      );
      onChange(newSelectedIds);
    } else {
      // Clear cache for single select
      setSelectedItemsCache([]);
      onChange(undefined);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolledToBottom =
      Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) <
      1;

    if (
      scrolledToBottom &&
      !isLoading &&
      (pager.page ?? 1) < (pager.pages ?? 0)
    ) {
      fetchNextPage();
    }
  };

  // Get selected items for display from cache, filtered by current selection
  const selectedItems = React.useMemo(() => {
    const filteredItems = selectedItemsCache.filter((item) =>
      selectedIds.includes(String(item[config.idKey])),
    );
    // For single select, ensure we only display one item
    return isMultiple ? filteredItems : filteredItems.slice(0, 1);
  }, [selectedItemsCache, selectedIds, config.idKey, isMultiple]);

  const { display, slots, popupTitle } = config;
  const isStatic = !display || typeof display === "string";
  const Pop = isStatic ? Popup : DynamicPopup;

  const renderCommand = (close: RenderOptions['close']) => {
    return (
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={config.placeholder ?? i18n.t("Search...")}
          value={searchTerm}
          onValueChange={search}
          disabled={disabled}
        />
        <CommandList
          className="h-[300px] overflow-y-auto "
          onScroll={handleScroll}
        >
          <CommandEmpty>
            {(isLoading && !isFetchingNextPage) ? (
              <div className="flex items-center justify-center py-6">
                <Icons.Sync className="h-4 w-4 animate-spin mr-2" />
                <Items.Tr>Loading...</Items.Tr>
              </div>
            ) : (
              <Items.Tr>No results found</Items.Tr>
            )}
          </CommandEmpty>

          {items.map((item) => {
            const itemId = String(item[config.idKey]);
            const isSelected = selectedIds.includes(itemId);

            return (
              <RelationSelectorItem
                key={itemId}
                item={item}
                config={config}
                isSelected={isSelected}
                onSelect={() => handleSelect(item, close)}
                showCheckbox={isMultiple}
              />
            );
          })}

          {(isFetchingNextPage) && (
            <div className="flex items-center justify-center py-2">
              <Icons.Sync className="h-4 w-4 animate-spin" />
            </div>
          )}

          {!hasNextPage && items.length > 0 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              <Items.Tr>No more items</Items.Tr>
            </div>
          )}
        </CommandList>
      </Command>
    );
  };

  const renderContent = ({ display, close }: RenderOptions) => {
    switch (display) {
      case "raw":
        return renderCommand(noop);
      case "popover":
        return renderCommand(close);

      default:
        return (
          <>
            <Dialog.Header onClose={close}>{popupTitle}</Dialog.Header>
            <Dialog.Body>{renderCommand(close)}</Dialog.Body>
          </>
        );
    }
    return "";
  };

  return (
    <div className={cn("overflow-auto", className)}>
      {/* Display selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedItems.map((item) => {
            const itemId = String(item[config.idKey]);
            const label = config.label
              ? config.label(item)
              : String(item[config.labelKey]);
            return (
              <div
                key={itemId}
                className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm max-w-full min-w-0"
              >
                <div className="min-w-0 flex-1">{label}</div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(itemId)}
                    className="text-secondary-foreground/70 hover:text-secondary-foreground"
                  >
                    <Icons.Close className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pop
        display={display as Display}
        renderContent={renderContent}
        slots={slots}
      >
        <Button
          variant="outlined"
          size="sm"
          type="button"
          disabled={disabled}
          className="gap-2"
          //ref={triggerRef.current?.ref}
        >
          <Icons.Add className="h-4 w-4" />
          {isMultiple
            ? selectedItems.length > 0
              ? i18n.t(`Add more (%s selected)`, selectedItems.length)
              : (selectorLabel ?? <Items.Tr>Select items</Items.Tr>)
            : selectedItems.length > 0
              ? i18n.t("Change selection")
              : (selectorLabel ?? <Items.Tr>Select item</Items.Tr>)}
        </Button>
      </Pop>
    </div>
  );
}

/**
 * Utility function to create a relation selector configuration
 */
export function createRelationSelectorConfig<T>(
  config: Readonly<RelationSelectorConfig<T>>,
): RelationSelectorConfig<T> {
  return config;
}
