import React from "react";
import useEnhancedEffect from "./useEnhancedEffect";
import { EMPTY_ARRAY } from "../lib/constants";

/**
 * Alternative to useCallback that doesn't update the callback when dependencies change
 *
 * @see https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
 * @see https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
function useEvent<
  Fn extends (...args: any[]) => any = (...args: unknown[]) => unknown,
>(fn?: Fn): Fn;
function useEvent<Args extends unknown[], Return>(
  fn?: (...args: Args) => Return,
): (...args: Args) => Return;

function useEvent<Args extends unknown[], Return>(
  fn?: (...args: Args) => Return,
): (...args: Args) => Return {
  const ref = React.useRef<typeof fn>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  useEnhancedEffect(() => {
    ref.current = fn;
  });

  return React.useCallback(
    (...args: Args) => ref.current?.(...args) as Return,
    EMPTY_ARRAY,
  );
}

export { useEvent };
