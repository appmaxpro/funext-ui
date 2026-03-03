import React, {
  memo,
  useMemo,
  useCallback,
  createContext,
} from "react";
import {
  useVirtual,
  List,
  createListItemRef,
  useSubscription,
} from "@af-utils/virtual-react";
import type { ListItemProps, ListProps } from "@af-utils/virtual-react";
import {
  VirtualScrollerEvent,
  type VirtualScrollerInitialParams,
} from "@af-utils/virtual-core";

import MuxList, { type ListItemProps as MuxListProps } from "@funext/ui/List";
import { LayoutContext } from "~/context";
import { useRefs } from "@funext/ui";
import { useAsync } from "~/hooks/use-async";

const EVENTS = [VirtualScrollerEvent.RANGE] as const;

const LayoutScrollerList = React.forwardRef((props, forwardRef) => {
  const { setScrollerRef } = React.useContext(LayoutContext);
  const ref = useRefs(forwardRef, setScrollerRef);
  return <MuxList {...props} ref={ref} />;
});

interface VirtualListProps
  extends Omit<ListProps<"ul">, "model" | "children">,
    Omit<MuxListProps, "children" | "component"> {
  modelProps?: VirtualScrollerInitialParams;
  Item: React.ComponentType<ListItemProps & { data: any }>;
  itemProps?: any;
  withLayoutScroller?: boolean;
  fetch: (offset: number) => Promise<any[]>;
}

export const RawVirtualList: React.FC<Omit<VirtualListProps, 'itemProps'>> = (props) => {
  const {
    withLayoutScroller = true,
    component: ListComponent = withLayoutScroller
      ? LayoutScrollerList
      : MuxList,
    modelProps,
    Item,
    fetch,
    ...others
  } = props;

  const {
    state,
    data: items = [],
    error,
    retryFn,
  } = useAsync(useCallback(async () => fetch(model.to), [fetch]));

  const model = useVirtual({
    itemCount: items.length,
    ...modelProps,
  });

  useSubscription(
    model,
    EVENTS,
    useCallback(() => {
      if (
        state !== "loading" &&
        state !== "error" &&
        items.length === model.to
      ) {
        retryFn();
      }
    }, [model, state, items]),
  );

  return (
    <List
        {...others}
        itemData={items}
        footer={
          state === "loading" || state === "error" ? (
            <div ref={(el) => model.setStickyFooter(el)}>Loading ...</div>
          ) : null
        }
        component={ListComponent}
        model={model}
      >
        {Item}
      </List>
  );
};

export type { ListItemProps as VirtualListItemProps };
export { createListItemRef as createVirtualListItemRef };
export default RawVirtualList;
