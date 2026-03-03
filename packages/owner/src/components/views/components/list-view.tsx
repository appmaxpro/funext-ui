import * as React from "react";
import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  isPlainObject,
  type DataRecord,
  type Identifier,
} from "~/utils";
import {
  EvalDataContext,
  ListViewContext,
  useEvalDataContext,
  useListViewContext,
  useResourceContext,
} from "~/context";
import { useViewSwitch } from "../tabs/use-tabs";
import type {
  FieldBlockProps,
  IndexRecord,
  WidgetBlockProps,
  WidgetBlockPropsWithRef,
} from "../types";
import { createStore, ListItem, type SxComponentProps } from "@funext/ui";
import type { VirtualScrollerInitialParams } from "@af-utils/virtual-core";

export function ListView({
  children,
  virtual,
  ref,
}: SxComponentProps & { virtual?: boolean }) {
  const { tab, dataStore } = useResourceContext();
  const action = tab.action;

  const switchTo = useViewSwitch();

  const [context, setContext] = React.useState(() => tab.action.evalContext);

  const getContext = React.useCallback(
    (record: IndexRecord) => {
      const rec = isPlainObject(record)
        ? record
        : (dataStore.records[record] ?? {});
      const newContext = action.evalContext._subContext(rec);
      return newContext;
    },
    [action],
  );

  const showDetail = React.useCallback(
    async (record: DataRecord | Identifier) => {
      const identifier = isPlainObject(record) ? record.id : record;
      switchTo("form", { route: { id: String(identifier ?? "") } });
    },
    [switchTo],
  );

  const [listModel, setListModel] = React.useState<VirtualScrollerInitialParams>(() => ({
    itemCount: dataStore.page.total
  }));

  React.useEffect(() => {
    if (virtual) {
      let page = dataStore.page;
      function updateModel() {
        setListModel({
          itemCount: page.total!
        })
      }

      return dataStore.subscribe(() => {
        if (
          dataStore.page.limit !== page.limit ||
          dataStore.page.total !== page.total
        ) {
          page = dataStore.page;
          updateModel();
        }
      });
    }
  }, [virtual, dataStore]);

  return (
    <ListViewContext.Provider
      value={React.useMemo(() => {
        const canShow = tab.action.views.some((view) => view.type === "form");
        return { getContext, ...(canShow && { showDetail }) };
      }, [getContext, showDetail])}
    >
      
      {children}
    </ListViewContext.Provider>
  );
}
//export function ListItem(props
function View() {

}

function VirtualView() {

}

export function ListRecord({
  children,
  ref,
  record,
  data,
}: WidgetBlockPropsWithRef & {
  record?: IndexRecord;
  data?: IndexRecord;
  props?: any;
}) {
  const rec = record ?? data ?? EMPTY_OBJECT;
  const { getContext, showDetail } = useListViewContext();
  //const context = useEvalDataContext();
  const context = React.useMemo(() => getContext(rec), [getContext, rec]);

  if (!ref) {
  }

  const itemChildren = React.Children.toArray(children);

  if (itemChildren.length === 1)
    return (
      <EvalDataContext.Provider value={context}>
        <ListItem ref={ref as any}>{children}</ListItem>
      </EvalDataContext.Provider>
    );
}

function Field({ children, ref, ...props }: FieldBlockProps) {
  return null;
}

export declare namespace List {
  export { ListView as Root };
  export { ListView as List };
  export { ListRecord };
  export { Field };
}
