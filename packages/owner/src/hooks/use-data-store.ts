import { useEffect, useState } from "react";
import type { DataStore } from "~/utils/data-store";

export function useDataStore<T>(
  store: DataStore,
  selector: (store: DataStore) => T
): T {
  const [state, setState] = useState<T>(selector(store));
  useEffect(() => {
    return store.subscribe(() => {
      setState(() => selector(store));
    });
  }, [store, selector]);
  return state;
}
