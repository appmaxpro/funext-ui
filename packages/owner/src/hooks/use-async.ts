import {
  type DependencyList,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EMPTY_ARRAY, EMPTY_DEPS } from "~/utils/constant";

export function useAsync<T>(
  func: (abort?: AbortSignal) => Promise<T>,
  deps: DependencyList = EMPTY_ARRAY,
): {
  state?: "loading" | "error";
  data?: T;
  error?: any;
  retryFn: () => void;
} {
  const [isLoading, setLoading] = useState(true);
  const abortRef = useRef<AbortController>(undefined);

  useEffect(() => {
    abortRef.current = new AbortController();
    return () => {
      abortRef.current?.abort();
    };
  }, EMPTY_DEPS);

  const [{ state, data, error }, setState] = useState<{
    state?: "loading" | "error";
    data?: T;
    error?: any;
  }>({});

  const [retry, setRetry] = useState(0);

  const retryFn = useCallback(() => {
    if (!isLoading) setRetry((retry) => retry + 1);
  }, [setRetry, isLoading]);

  useEffect(() => {
    if (!abortRef.current) return;

    if (abortRef.current!.signal.aborted) {
      abortRef.current = new AbortController();
    }

    let canceled = false;
    let loading = false;
    const signal = abortRef.current!.signal;
    //@ts-ignore
    setLoading(true);
    async function load() {
      loading = true;
      try {
        const data = await func(signal);
        if (canceled || signal.aborted) {
          return;
        }
        setState({ state: undefined, data });
      } catch (e) {
        setState((draft) => ({ ...draft, state: "error", error: e }));
      } finally {
        loading = false;
        setLoading(false);
      }
    }
    load();

    return () => {
      canceled = true;
      if (loading && !signal.aborted) {
        abortRef.current?.abort();
      }
    };
  }, [...deps, retry]);

  return {
    state: isLoading ? "loading" : state,
    data,
    error,
    retryFn,
  };
}
