import {
  type DependencyList,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useAsyncEffect } from "./use-async-effect";
import { EMPTY_ARRAY } from "~/utils/constant";

export function useAsync<T>(
  func: (abort?: AbortSignal) => Promise<T>,
  deps: DependencyList = EMPTY_ARRAY,
): {
  state?: "loading" | "error";
  data?: T;
  error?: any;
  retryFn: () => void;
} {
  const [isPending, startTransition] = useTransition();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    abortRef.current = new AbortController();
    return () => {
      abortRef.current?.abort();
    };
  }, EMPTY_ARRAY);

  const [{ state, data, error }, setState] = useState<{
    state?: "loading" | "error";
    data?: T;
    error?: any;
  }>({});

  const [retry, setRetry] = useState(0);

  const retryFn = useCallback(() => {
    if (!isPending) setRetry((retry) => retry + 1);
  }, [setRetry, isPending]);

  useEffect(() => {
    if (!abortRef.current) return;

    if(abortRef.current!.signal.aborted) {
       abortRef.current = new AbortController();
    }

    let canceled = false;
    let loading = false;
    const signal = abortRef.current!.signal;
    //@ts-ignore
    startTransition(async () => {
      loading = true;
      try {
        const data = await func(signal);
        if (canceled || signal.aborted) {
          return;
        }
        startTransition(() => setState({ state: undefined, data }));
      } catch (e) {
        startTransition(() =>
          setState((draft) => ({ ...draft, state: "error", error: e })),
        );
      } finally {
        loading = false;
      }
    });
    return () => {
      canceled = true;
      if(loading && !signal.aborted) {
        abortRef.current?.abort()
      }
    };
  }, [...deps, retry]);

  return {
    state: isPending ? "loading" : state,
    data,
    error,
    retryFn,
  };
}
