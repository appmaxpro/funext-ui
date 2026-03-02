import { useCallback, useMemo, useState } from "react";

import { i18n } from "~/utils";
import type { FilterFieldOptions } from "~/utils/filter";
import type { FilterProps } from "../types";
import Tabs from "~/components/other/tabs";
import { composeRefs } from "~/utils/compose-ref";

export function TabFilter({
  item,
  onChange,
  value,
  ref,
  ...props
}: FilterProps<FilterFieldOptions>) {
  const { options } = item;
  //const { modifiers } = useResourceContext();

  const tabs = useMemo(
    () =>
      options.map((opt) => ({
        ...opt,
        id: opt.value!,
        children: i18n.get(opt.title ?? opt.value!),
        "data-value": opt.value!,
      })),
    [item],
  );

  const [activeTab, setActiveTab] = useState<string>(() =>
    value && tabs.map((o) => o.id).includes(value) ? value : tabs[0].id,
  );

  const thisRef = useCallback(
    (ref: HTMLDivElement) => {
      if (ref && activeTab !== value && activeTab) {
        const button = ref.querySelector(`[data-value="${activeTab}"]`);
        button && (button as any).click();
      }
    },
    [activeTab, value, onChange],
  );

  const onTabClick = useCallback(
    (path: string, e: React.BaseSyntheticEvent<object, any, any>) => {
      e.preventDefault();
      setActiveTab(path);
    },
    [],
  );

  if (!tabs.length) return null;

  return (
    <Tabs
      {...props}
      activeTab={activeTab}
      tabs={tabs}
      onTabClick={onTabClick}
      data-list=""
      data-filter-key={item.name}
      ref={composeRefs<HTMLDivElement>(ref, thisRef)}
    />
  );
}
