import { noop } from "../utils";

export default function useIf<F extends (...args: any[]) => any>(
  cond: boolean,
  fn: F,
  ...args: any[]
): ReturnType<F> {
  const useFn = cond ? fn : noop;
  return useFn(...args);
}
