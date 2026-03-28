import { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "~/utils";
import { useLazyRef } from "@funext/ui";

type FetchReturn<F extends (...args :Parameters<F>) => ReturnType<F>> = {
    state?: "loading" | "error";
    isLoading: boolean;
    error?: any;
    signal: AbortSignal;
    fetch: F;
}

export function useAsyncFetch<F extends (...args :Parameters<F>) => ReturnType<F>>(search: F)
: FetchReturn<F>{

  const [{ state, error }, setState] = useState<{
    state?: "loading" | "error";
    error?: any;
  }>(EMPTY_OBJECT);

  const abortRef = useLazyRef(()=> new AbortController());
  
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, EMPTY_ARRAY);

  const fetch = useCallback(
    async (...arg: Parameters<F>) => {
      if (!abortRef.current) return;

      if (abortRef.current!.signal.aborted) {
        abortRef.current = new AbortController();
      }

      setState((prev) => {
        if (prev.state === 'loading') {
          abortRef.current?.abort();
          abortRef.current = new AbortController();
          return prev
        }
        return ({ ...prev, error: undefined, state: "loading" })
      });
      try {
        const data = await search(...arg);

        setState(()=> EMPTY_OBJECT);

        return data;

      } catch (error) {
        setState((prev) => ({ ...prev, error, state: "error" }));
        throw error
      }
    },
    [search],
  ) as typeof search;


  return {
    fetch,
    state,
    isLoading: state === 'loading',
    error,
    signal: abortRef.current.signal
  }
}
