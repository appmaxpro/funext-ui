import {
  VirtualScroller,
  VirtualScrollerEvent,
  type VirtualScrollerInitialParams,
} from "@af-utils/virtual-core";
import type { ListItemProps, ListProps } from "@af-utils/virtual-react";
import {
  List,
  createListItemRef,
  useSubscription,
  useVirtual,
} from "@af-utils/virtual-react";
import React, { useCallback } from "react";

import { Box, useRefs, List as MuxList} from "~/ui";
import { LayoutContext } from "~/context";
import { EMPTY_OBJECT, i18n } from "~/utils";
import { Toolbar } from "./toolbar";

const EVENTS = [VirtualScrollerEvent.RANGE] as const;

const VirtualScrollerList = React.forwardRef<HTMLElement, any>(
  ({ children, ...props }, forwardRef) => {
    const { setScrollerRef } = React.useContext(LayoutContext) ?? EMPTY_OBJECT;
    const ref = useRefs(forwardRef, setScrollerRef);
    //console.error("-----VirtualScrollerList---------props:", props)
    return (
      <Box
        data-ui="VirtualScrollerList"
        {...props}
        ref={ref}
        component="div"
      >
        <Toolbar/>
        {children}
      </Box>
    );
  },
);

interface VirtualListProps
  extends Omit<ListProps<"div">, "model" | "children">,
    Omit<React.ComponentProps<typeof MuxList>, "children" | "component"> {
  model: VirtualScrollerInitialParams;
  Item: React.ComponentType<ListItemProps>;
  itemProps?: any;
  withLayoutScroller?: boolean;
  fetch: (offset: number) => Promise<any[]>;
  state?: "loading" | "error";
  renderHeader?: (model: VirtualScroller) => React.ReactNode;
}

export const VirtualList: React.FC<Omit<VirtualListProps, "itemProps">> = (
  props,
) => {
  const {
    withLayoutScroller = true,
    component: ListComponent = withLayoutScroller ? VirtualScrollerList : Box,
    model: modelProps,
    Item,
    fetch,
    state,
    renderHeader,
    ...others
  } = props;

  const model = useVirtual(modelProps);
  const { itemCount } = modelProps;

  useSubscription(
    model,
    EVENTS,
    useCallback(() => {
      if (
        (state !== "loading" &&
          //state !== "error" &&
          itemCount == null) ||
        itemCount! > model.to
      ) {
        fetch(model.to);
      }
    }, [model, state, itemCount]),
  );

  const header = React.useMemo(
    () => renderHeader?.(model),
    [model, renderHeader],
  );

  return (
    <List
      data-ui="VirtualList"
      footer={
        state === "loading" || state === "error" ? (
          <div
            className="flex justify-center items-center text-primary"
            ref={(el) => model.setStickyFooter(el)}
          >
            {i18n.get("Loading ...")}
          </div>
        ) : null
      }
      component={ListComponent}
      header={header as React.JSX.Element}
      {...others}
      model={model}
    >
      {Item}
    </List>
  );
};

export const FixedVirtualList: React.FC<
  Omit<VirtualListProps, "fetch" | "state">
> = (props) => {
  const {
    withLayoutScroller = false,
    component: ListComponent = withLayoutScroller
      ? VirtualScrollerList
      : MuxList,
    model: modelProps,
    Item,
    renderHeader,
    ...others
  } = props;

  const model = useVirtual(modelProps);
  const header = React.useMemo(
    () => renderHeader?.(model),
    [model, renderHeader],
  );

  return (
    <List
      data-ui="VirtualList"
      component={ListComponent}
      header={header as React.JSX.Element}
      {...others}
      model={model}
    >
      {Item}
    </List>
  );
};

export { createListItemRef as createVirtualItemRef };
export type { ListItemProps as VirtualListItemProps, VirtualScroller };
export default VirtualList;
