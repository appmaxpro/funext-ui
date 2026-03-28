import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMPTY_ARRAY,
  i18n,
  isField,
  isPlainObject,
  type FieldBlock,
  type WidgetBlock,
} from "~/utils";
import { Pane, StatelessWidget } from "./pane";
import { useFormWidgetState, WidgetStateProvider } from "./root";
import { Box, Flex, InViewProvider, useLazyRef, clsx } from "@funext/ui";
import { isEqual } from "lodash";
import { Tabs } from "~/components/shared";
import { getBlockItems, meta, type IFieldState } from "~/scope";

type StatelessProps = { block: WidgetBlock; ref?: any };
type StatefulWidgetProps = { ref?: any };

export const FormTabs = meta(
  React.memo<StatelessProps>(({ block, ref }) => {
    const newBlock = useLazyRef(() => ({ ...block, tag: TabsTab })).current;

    return (
      <WidgetStateProvider widget={block}>
        <TabsTab ref={ref} />
      </WidgetStateProvider>
    );
  }),
  { wrap: "prop", noProps: true },
);

const TabsTab = React.memo<StatefulWidgetProps>(({ ref }) => {
  const { state, widget } = useFormWidgetState<IFieldState>();

  const block = widget.block as FieldBlock;

  const [activeTab, setActiveTab] = useState<number>(0);

  const items = useMemo(
    () =>
      getBlockItems(block)
        .filter(isPlainObject)
        .filter((block) => block.type === "Pane"),
    [block],
  ) as WidgetBlock[];

  const visibleItemsRef = useLazyRef<WidgetBlock[]>(() =>
    items.filter((block) => !block.hidden),
  );

  const [tabs, setSetTabs] = useState<FormTabProps[]>(
    () =>
      items.map((item) => ({
        id: item.uid,
        hidden: !!item.hidden,
      })) as FormTabProps[],
  );

  const setTabProps = useCallback(
    (tab: FormTabProps) => {
      const indices = items.map((item) => item.uid);
      setSetTabs((tabs) => {
        if (tab.hidden && !tabs.some((item) => item.id === tab.id)) return tabs;

        const newTabs = [...tabs.filter((item) => item.id !== tab.id), tab];
        const newTabIds = newTabs.map((item) => item.id);
        visibleItemsRef.current = items.filter((item) =>
          newTabIds.includes(item.uid),
        );

        const sortedTabs = newTabs
          .filter((item) => !item.hidden)
          .sort((a, b) => indices.indexOf(a.id) - indices.indexOf(b.id));

        setActiveTab((activePage) => {
          if (activePage < newTabIds.length) {
            return activePage;
          }
          return 0;
        });

        return sortedTabs;
      });
    },
    [setSetTabs],
  );

  const onTabClick = useCallback(
    (e: React.BaseSyntheticEvent<object, any, any>, index: number) => {
      e.preventDefault();
      setActiveTab(index);
    },
    [setActiveTab],
  );

  if (!activeTab || state.hidden) {

  }

  return (
    <Flex width="100%" ref={ref} direction="column">
      <DummyTabs tabs={items} setTabProps={setTabProps} />

      <Tabs activeTab={activeTab} tabs={tabs} onTabClick={onTabClick} />

      {visibleItemsRef.current.map((block, index) => (
        <TabContent block={block} active={index === activeTab} key={block.uid} />
      ))}
    </Flex>
  );
});

function TabContent({
  block,
  active,
  ref,
}: {
  block: WidgetBlock;
  active: boolean;
  ref?: any;
}) {
  const display = active ? "contents" : "none";

  
  return (
    <InViewProvider visible={active}>
      <div
        className={clsx(
          active ? "contents" : "none",
          //styles.tabContent,
          //navWidget === "tabs" && "border",
          //schema.widgetAttrs?.displayMode === "tree" && "rounded",
        )}
      >
        <StatelessWidget block={block} ref={ref} />
      </div>
    </InViewProvider>
  );
}

type FormTabProps = {
  id: string;
  hidden: boolean;
  children: React.ReactNode;
};

type SetTabProps = (props: FormTabProps) => void;

// used to handle hidden state
const DummyTabs = React.memo(function DummyTabs({
  tabs,
  setTabProps,
}: {
  tabs: WidgetBlock[];
  setTabProps: SetTabProps;
}) {
  return (
    <div style={{ display: "none" }}>
      {tabs.map((item) => (
        <WidgetStateProvider key={item.uid} widget={item as WidgetBlock}>
          <DummyTab setTabProps={setTabProps} />
        </WidgetStateProvider>
      ))}
    </div>
  );
});

const DummyTab = React.memo(function DummyTab({
  setTabProps,
}: {
  setTabProps: SetTabProps;
}) {
  //const parentState = React.useSyncExternalStore(parent.subscribe, parent.snapshot);

  const { state, widget } = useFormWidgetState();

  const block = widget.block;

  const title = React.useMemo(
    () =>
      i18n.t(
        block.schema.title ??
          state.props?.title ??
          block.schema.name ??
          block.uid,
      ),
    EMPTY_ARRAY,
  );

  const tapRef = useLazyRef(() => ({ id: block.uid, hidden: !!state.hidden }));

  useEffect(() => {
    const newTab = { id: block.uid, hidden: !!state.hidden, children: title };
    if (!isEqual(newTab, tapRef.current)) {
      tapRef.current = newTab;
      setTabProps(newTab);
    }
  }, [state]);

  return null;
});
