import {
  type DependencyList,
  type EffectCallback,
  useEffect,
  useRef,
} from "react";

type AsyncEffectCallbackResult = ReturnType<EffectCallback>;
type AsyncEffectCallback = (
  signal: AbortSignal,
) => Promise<AsyncEffectCallbackResult>;

export function useAsyncEffect(
  effect: AsyncEffectCallback,
  deps?: DependencyList
) {
  const abortRef = useRef<AbortController>(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    const signal = abortRef.current!.signal;
    let result: AsyncEffectCallbackResult;
    const load = async () => {
      if (canceled || signal.aborted) {
        return;
      }
      result = await effect(signal);
    };

    queueMicrotask(load);

    return () => {

      canceled = true;
      if (result) {
        result();
      }
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
