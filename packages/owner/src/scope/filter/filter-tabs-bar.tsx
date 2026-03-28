import React from "react";
import { useResourceContext, useViewContext } from "~/context";
import type { FilterTabs } from "~/utils/filter";
import { TabFilter } from "./widgets/tab-filter";
import type { ListViewBlock } from "~/utils";

export function FilterTabsBar({ tabs, ref }: { tabs: FilterTabs, ref?: any }) {
  const { query: listParams, modifiers, doSearch } = useResourceContext();
  const viewContext = useViewContext<ListViewBlock>()
  const params = listParams!;

  const prevFilterRef = React.useRef();

  const selected = React.useMemo(() => {
    const filter = params.filter;
    const value = filter?.[tabs.name!];
    console.log("FilterTabsBar::useMemo:filter:", {[tabs.name!]: value})
    return tabs.options.find((item) => item.value === value) ?? tabs.options[0];
  }, [tabs, params.filter]);

  const hasTabFilter = React.useRef(false);

  const onChange = React.useCallback(
    (val?: any) => {
      
      if(prevFilterRef.current === val) {
        return
      }
      prevFilterRef.current = val;
      hasTabFilter.current = true;
      modifiers!.updateFilters({ [tabs.name]: val }, false);
      console.log("FilterTabsBar::onChange:", { [tabs.name]: val })
    },
    [modifiers],
  );

  React.useEffect(() => {
    console.log("FilterTabsBar::filter:", params.filter)
    if (hasTabFilter.current) {
      hasTabFilter.current = false;
      const search = viewContext.search ?? doSearch
      search();
    }
  }, [params.filter]);

  console.log("FilterTabsBar::selected:", selected)
  if (selected) {
    return (
      <div className="py-2" ref={ref}>
        <TabFilter
          item={tabs!}
          onChange={onChange}
          value={selected.value}
          showTabsScroll={false}
        />
      </div>
    );
  }
}
