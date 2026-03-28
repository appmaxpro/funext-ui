import {
  EMPTY_ARRAY,
  type Container,
  type DataContext,
  type DataStore,
  type FormView,
  type Property,
  type ViewBlock,
} from "~/utils";
import type { ListModifiers, ListParams, Ref, TabProps } from "./types";
import React from "react";
import { useLazyRef } from "@funext/ui";
import { useResourceContext, ViewContext } from "~/context";
import { useViewProps } from "./routes";
import type { FilterTabs, FilterWidget } from "~/utils/filter";

type Props = {
  value: {
    view: ViewBlock;
    dataStore?: DataStore;
    evalContext?: DataContext;
    context?: DataContext;
    fields?: Property[];
    query?: ListParams;
    modifiers?: ListModifiers;
    filterTabs?: FilterTabs;
    filterSidebar?: Container<FilterWidget>;
    filterForm?: FormView;
  };
  children: React.ReactNode;
};

type ActionRef = {
  readonly context?: DataContext;
  readonly evalContext?: DataContext;
  readonly fields?: Property[];
};

type SaveState = (props: TabProps, save?: boolean) => void;

export function ViewProvider({ children, value }: Props) {
  const [props, setProps] = useViewProps();

  
  const bind = React.useCallback(
    (bindRef: ActionRef) => {
      const ref = {
        ...valueRef.current,
        ...bindRef,
      };
      const newProps = {
        ...ref,
        get context() {
          return ref.context;
        },
        get evalContext() {
          return ref.evalContext;
        },
        get fields() {
          return ref.fields;
        },
      };

      valueRef.current = newProps;
    },
    [value],
  );

  const propsRef = useLazyRef(() => props);
  const stateRef = useLazyRef(() => ({}) as any);
  const saveStatesRef = useLazyRef<Set<SaveState>>(() => new Set());

  const saveState = React.useCallback(
    (props: TabProps) => {
      saveStatesRef.current.forEach((fn) => fn(props, true));
    },
    [value],
  );

  const restoreState = React.useCallback(
    (props: TabProps) => {
      saveStatesRef.current.forEach((fn) => fn(props, false));
    },
    [value],
  );

  const addSaveState = React.useCallback((saveState: SaveState) => {
    saveStatesRef.current.add(saveState);

    return () => saveStatesRef.current.delete(saveState);
  }, []);

  const getProps = React.useCallback(() => {
    return propsRef.current;
  }, []);

  React.useEffect(() => {
    if (!props?.actions || props.actions.saveState !== saveState) {
      setProps({
        actions: {
          state: stateRef.current,
          saveState,
          restoreState,
        },
      });
    } else {
      propsRef.current = props;
    }
  }, [props]);



  const [sideOpen, setSideOpen] = React.useState<boolean|undefined>(false);
  const [formOpen, setFormOpen] = React.useState<boolean|undefined>(false);
  
  React.useEffect(() => {
     console.log("ViewProvider:: start");
  }, [setSideOpen])

  const valueRef = useLazyRef(() => ({
    ...value,
    bind,
    getProps,
    setProps,
    addSaveState,
    sideOpen,
    setSideOpen,
    formOpen,
    setFormOpen,
  }));

  const newValue = React.useMemo(() => {
    const newValue = {
      ...valueRef.current,
      ...value,
      bind,
      getProps,
      setProps,
      addSaveState,
      sideOpen,
      setSideOpen,
      formOpen,
      setFormOpen,
    };
    valueRef.current = newValue;
    
    return newValue;
  }, [value, bind, getProps, setProps, addSaveState, sideOpen, setSideOpen, formOpen, setFormOpen]);

  return (
    <ViewContext.Provider value={newValue}>{children}</ViewContext.Provider>
  );
}

function useFilterStates() {
  const [sideOpen, setSideOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  //const [Open, setSideOpen] = React.useState(false);

  return;
}
