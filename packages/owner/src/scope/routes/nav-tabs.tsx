import {
  clsx,
  ContainerSizeProvider,
  Text,
  Tooltip as MuxTooltip,
  useContainerSize,
  useResizeDetectorRef,
  Portal,
} from "~/ui";

import { useCallback, useEffect, useRef } from "react";

import { setRootStore, useTabs, useTabsStore } from "./use-tabs";
import { ResViews } from "../resource-views";
import type { Tab } from "../types";
//import { CustomRoute } from "~/routes";
import { EMPTY_ARRAY, isDevelopment } from "~/utils";

export function useNavTabsSize() {
  return useContainerSize().current;
}

export function NavTabs({ container }: { container: HTMLDivElement | null }) {
  const store = useTabsStore();

  const { active, items: tabs, popups, open, close, change } = useTabs();
  const value = active?.id;
  setRootStore(store);
  console.log("NavTabs: change:", change, "\ntabs:", tabs, ", type:", active?.state.type);
  //console.log("store:", store, "\ntabStore:", tabStore, "\nSameStore:", store == tabStore);

  const { ref, size } = useResizeDetectorRef(false);

  const items = tabs.filter((tab) => tab.state.visible !== false);

  const showInPortal = items.length > 0 && !!container;
  const showInplace = items.length > 0 && !showInPortal;
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  //useTabAutoReload(active, doRefresh);
  useEffect(() => {
    return () => {
      console.log("NavTabs: destroy all");
      tabsRef.current.forEach((tab) => close(tab.id));
    };
  }, EMPTY_ARRAY);

  return (
    <div
      ref={ref}
      className="tabs parent-view"
      data-tab-container-size={size.current ?? "lg"}
      data-tab-active={active?.id}
    >
      {/*<ContainerSizeProvider value={size}>*/}
      {showInPortal && (
        <Portal root={container}>
          {/*<Tabs
              className={styles.tabList}
              items={items}
              active={value}
              //onItemClick={handleItemClick}
            />*/}
          <div></div>
        </Portal>
      )}
      {/*showInplace && <SingleTab items={items} />*/}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          data-tab-content={tab.id}
          data-tab-active={tab.id === value}
          className={clsx("tabContent parent-view", {
            invisible: tab.id !== value,
            hidden: tab.id !== value || tab.state.visible === false,
          })}
        >
          <ResViews tab={tab} />
        </div>
      ))}
      {isDevelopment && <TabsDirtyCheck tabs={tabs} />}
      {/*</ContainerSizeProvider>*/}
    </div>
  );
}

function TabsDirtyCheck({ tabs }: { tabs: Tab[] }) {
  const isTabDirty = useCallback(
    () => tabs.some((tab) => tab.state.dirty),
    [tabs],
  );

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (isTabDirty()) {
        e.preventDefault();
      }
    }

    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [isTabDirty]);

  return null;
}

export function SingleTab() {
  const { items, active = items?.find((tab) => tab.state.visible !== false) } =
    useTabs();
  if (active) {
    return <ResViews tab={active} />;
  }
  return null;
}
