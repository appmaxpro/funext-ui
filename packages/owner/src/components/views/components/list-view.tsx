import * as React from "react";
import { isPlainObject, type DataRecord, type Identifier } from "~/utils";
import { EvalDataContext, ListViewContext, useResourceContext } from "~/context";
import { useViewSwitch } from "../tabs/use-tabs";
import type { WidgetBlockPropsWithRef } from "../types";

export function ListView({children, ref}: React.ComponentPropsWithRef<"div">) {
  const { tab, dataStore } = useResourceContext();
  const action = tab.action;

  const switchTo = useViewSwitch();
   
  const [context, setContext] = React.useState(()=> tab.action.evalContext);

  const willRender = React.useCallback((record: DataRecord, resetContext?: boolean) => {
    const newContext = action.evalContext._subContext(record);
    if (resetContext !== false)
        setContext(newContext);
    return newContext;
  }, [action]);

  const showDetail = React.useCallback(async (record: DataRecord | Identifier) => {
    const identifier = isPlainObject(record) ? record.id : record;
    switchTo('form', {route: {id: String(identifier ?? '')}})
    
  }, [switchTo]);

  return (
    <ListViewContext.Provider
      value={React.useMemo(
        () => ({ willRender, showDetail }),
        [willRender, showDetail],
      )}>
      <EvalDataContext.Provider value={context}>
          {children}
      </EvalDataContext.Provider>
    </ListViewContext.Provider>
  );
}


export function ListItem({children, ref}: WidgetBlockPropsWithRef) {
   
}


function Field({children, ref}: WidgetBlockPropsWithRef) {
    
}


export declare namespace List {
  export {ListView as Root}
  export {ListView as List}
  export {ListItem as Item}
  export {Field}
}