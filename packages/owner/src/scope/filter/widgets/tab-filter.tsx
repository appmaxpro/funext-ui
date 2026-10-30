import { useCallback, useEffect, useMemo, useState } from "react";

import { i18n } from "~/utils";
import type { FilterTabs } from "~/utils/filter";
import type { FilterProps } from "../types";
import Tabs from "~/components/shared/tabs";
import { useLazyRef } from "~/ui";

export function TabFilter({
  item,
  onChange,
  value,
  ref,
  ...props
}: Omit<FilterProps<FilterTabs>, "onChange"> & {
  showTabsScroll?: boolean;
  onChange: (value?: any) => void;
}) {
  const { options } = item;
  //const { modifiers } = useResourceContext();

  const tabs = useLazyRef(() => {
    let tabs = options.map((opt) => ({
      children: i18n.get(opt.title ?? opt.value!),
      "data-value": opt.value ? opt.value : undefined,
    }));
    const hasActive = options.map((item) => item.value).indexOf(value);
    if (hasActive < 0 && value == null) {
      tabs.unshift({
        "data-value": undefined,
        children: i18n.get("All"),
      });
    }
    return tabs;
  });

  //const [activeTab, setActiveTab] = useState<number>(0);
  const activeTab = useMemo(() => {
    return Math.max(
      0,
      options.findIndex((tab) => tab.value === value),
    );
  }, [value, options]);
  
  const onTabClick = useCallback(
    (e: React.BaseSyntheticEvent<object, any, any>, index: number) => {
      e.preventDefault();
      onChange(options[index].value);
    },
    [onChange, options],
  );

  if (!tabs.current.length) return null;

  return (
    <Tabs
      data-ui="FilterItemTabs"
      {...props}
      activeTab={activeTab}
      tabs={tabs.current}
      onTabClick={onTabClick}
      data-list=""
      data-filter_key={item.name}
      ref={ref}
    />
  );
}
