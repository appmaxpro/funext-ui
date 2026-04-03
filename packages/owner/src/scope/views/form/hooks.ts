import React from "react";
import { useFormContext } from "~/context";
import { useViewSwitch } from "~/scope/routes";
import type { DataRecord, DataStore } from "~/utils";
import { i18n } from "~/utils/i18n";


/**
 * A hook to execute the callback after all the actions are executed.
 *
 * @param callback a stable callback (prefer using `useCallback`)
 * @returns a debounced callback that only executes after all the actions are completed
 */
export function useAfterActions<Type, Args extends Array<unknown>>(
  callback: (...args: Args) => Promise<Type>,
) {
  const { executer: actionExecutor } = useFormContext();

  const waitRef = React.useRef<Promise<Type> | undefined>(undefined);
  const argsRef = React.useRef<Args | undefined>(undefined);
  const funcRef = React.useRef<((...args: Args) => Promise<Type>) | undefined>(
    undefined,
  );

  const reset = React.useCallback(() => {
    const func = funcRef.current!;
    const args = argsRef.current!;
    funcRef.current = undefined;
    argsRef.current = undefined;
    waitRef.current = undefined;
    return () => func?.(...args);
  }, []);

  return React.useCallback(
    async (...params: Args): Promise<Type> => {
      funcRef.current = callback;
      argsRef.current = params;
      if (waitRef.current) return waitRef.current;
      const promise = new Promise<Type>((resolve, reject) => {
        actionExecutor.waitFor().then(() =>
          actionExecutor
            .wait()
            .then(reset)
            .then((func: Function) => func())
            .then(resolve)
            .catch(reject)
            .finally(reset),
        );
      });
      waitRef.current = promise;
      return promise;
    },
    [actionExecutor, callback, reset],
  );
}

export function usePagination(
  dataStore: DataStore,
  record: DataRecord,
  readonly?: boolean,
) {
  const { offset = 0, limit = 0, total = 0 } = dataStore.page;
  const index = dataStore.records.findIndex((x) => x.id === record.id);

  const switchTo = useViewSwitch();

  const onPrev = React.useCallback(async () => {
    let prev = dataStore.records[index - 1];
    if (prev === undefined) {
      const { records = [] } = await dataStore.search({
        offset: offset - limit,
      });
      prev = records[records.length - 1];
    }
    const id = String(prev.id);
    const props = { readonly };
    switchTo("form", { route: { id }, props });
  }, [dataStore, index, limit, offset, readonly, switchTo]);

  const onNext = React.useCallback(async () => {
    let next = dataStore.records[index + 1];
    if (next === undefined) {
      const { records = [] } = await dataStore.search({
        offset: offset + limit,
      });
      next = records[0];
    }
    const id = String(next.id);
    const props = { readonly };
    switchTo("form", { route: { id }, props });
  }, [dataStore, index, limit, offset, readonly, switchTo]);

  const canPrev = index > -1 && offset + index > 0;
  const canNext = index > -1 && offset + index < total - 1;

  const text =
    index > -1 ? i18n.get("{0} of {1}", offset + index + 1, total) : "";

  return {
    canPrev,
    canNext,
    onPrev,
    onNext,
    text,
  };
}