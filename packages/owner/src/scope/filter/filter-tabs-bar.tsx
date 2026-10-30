import React from "react";
import { useViewContext } from "~/context";
import type { FilterTabs } from "~/utils/filter";
import { TabFilter } from "./widgets/tab-filter";
import { i18n, type ListViewBlock } from "~/utils";

const homeValue = ' ';

export function FilterTabsBar({ tabs: tabsProp, home, ref }: { 
    home?: boolean;
    tabs: FilterTabs;
    ref?: any;
  }) {
  const viewContext = useViewContext<ListViewBlock>()
  const {search, filters} = viewContext;
  const { query: listParams, modifiers } = filters 
  const params = listParams!;
  const tabs = React.useMemo(() => {
    let tabs = tabsProp;
    if (home) {
      tabs = {
        ...tabs,
        options: [
          {
            title: i18n.get('Home'),
            domain: () => [],
            value: homeValue
          } as any,
          ...tabs.options
        ]
      }
    }
    return tabs  
  }, [tabsProp, home]);

  const selected = React.useMemo(() => {
    const filter = params.filter;
    const value = filter?.[tabs.name!];
    console.log("FilterTabsBar::useMemo:filter:", {[tabs.name!]: value})
    return tabs.options.find((item) => item.value === value) ?? tabs.options[0];
  }, [tabs, params.filter]);

  const prevFilterRef = React.useRef(selected?.value);

  const onChange = React.useCallback(
    async (val?: any) => {

      console.log("FilterTabsBar::pre onChange:", {prev:prevFilterRef.current,   [tabs.name]: val });
      if(prevFilterRef.current === val) {
        return
      }
      
      
      prevFilterRef.current = val;
      //(modifiers as any).commit(false);
      
      const work = await modifiers!.updateFilters({ [tabs.name]: val }) as any;
      if(work === false) {
        console.log("FilterTabsBar::no work:")
        return;
      }

      search?.();
      console.log("FilterTabsBar::onChange:", { [tabs.name]: val })
    },
    [modifiers, search],
  );

  console.log("FilterTabsBar::selected:", selected)
  if (selected) {
    return (
      <div className="py-2" ref={ref}>
        <TabFilter
          item={tabs!}
          onChange={onChange}
          value={selected?.value}
          showTabsScroll={false}
        />
      </div>
    );
  }
}
