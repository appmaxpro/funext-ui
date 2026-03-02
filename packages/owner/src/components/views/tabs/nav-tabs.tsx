import {
  clsx,
  ContainerSizeProvider,
  Text,
  Tooltip as MuxTooltip,
  useContainerSize,
  useResizeDetectorRef,
  isDevelopment,
} from "@funext/ui";

import {
  useCallback,
  useEffect,
} from "react";

import {
  Portal,
} from "@funext/ui";


import { setRootStore, useTabs, useViewStore} from "./use-tabs";
import { Views } from "../resource-views";
import type { Tab } from "../types";


export function useNavTabsSize() {
  return useContainerSize().current;
}

export function NavTabs({ container }: { container: HTMLDivElement | null }) {
  const store = useViewStore();

  const { active, items: tabs, popups, open, close } = useTabs();
  const value = active?.id;
  setRootStore(store);
  //console.log("NavTabs: active:", active, "\ntabs:", tabs);
  //console.log("store:", store, "\ntabStore:", tabStore, "\nSameStore:", store == tabStore);

  const { ref, size } = useResizeDetectorRef(false, "NavTabsResizeDetector");


  const items = tabs.filter(tab => tab.state.visible !== false);

  const showInPortal = items.length > 0 && !!container;
  const showInplace = items.length > 0 && !showInPortal;

  //useTabAutoReload(active, doRefresh);
  
  return (
    <div
      ref={ref}
      className="tabs"
      data-tab-container-size={size.current ?? "lg"}
    >
      <ContainerSizeProvider value={size}>
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
        {showInplace && <SingleTab items={items} />}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-tab-content={tab.id}
            data-tab-active={tab.id === value}
            className={clsx('tabContent', {
              'invisible': tab.id === value,
            })}
          >
            <Views tab={tab} />
          </div>
        ))}
        {isDevelopment && <TabsDirtyCheck tabs={tabs} />}
        
        
      </ContainerSizeProvider>
    </div>
  );
}

function TabsDirtyCheck({ tabs }: { tabs: Tab[] }) {
  const isTabDirty = 
    useCallback(() => tabs.some((tab) => tab.state.dirty), [tabs])
  

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


function SingleTab({ items }: { items: Tab[] }) {
  const [item] = items;
  if (item) {
    const { title = item.title} = item.state;

    return <div className='singleTab'>{title}</div>;
  }
  return null;
}
