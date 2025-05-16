"use client";
import * as React from "react";

function defaultTrigger(store: React.MutableRefObject<number>, options: any) {
  const { disableHysteresis = false, threshold = 100, target } = options;
  const previous = store.current;

  if (target) {
    // Get vertical scroll
    store.current =
      target.pageYOffset !== undefined ? target.pageYOffset : target.scrollTop;
  }

  if (!disableHysteresis && previous !== undefined) {
    if (store.current < previous) {
      return false;
    }
  }

  return store.current > threshold;
}

const defaultTarget = typeof window !== "undefined" ? window : null;

export interface UseScrollTriggerOptions {
  disableHysteresis?: boolean;
  target?: Node | Window | null;
  threshold?: number;
  getTrigger?: (store: React.MutableRefObject<number>, options: any) => number;
  enabled?: boolean;
}

export default function useScrollTrigger(
  options: UseScrollTriggerOptions = {},
) {
  const {
    getTrigger = defaultTrigger,
    enabled = true,
    target = enabled ? defaultTarget : null,
    ...other
  } = options;
  const store = React.useRef<number>(0);
  const [trigger, setTrigger] = React.useState(() => getTrigger(store, other));
  React.useEffect(() => {
    if (target === null || !enabled) {
      return setTrigger(false);
    }
    const handleScroll = () => {
      setTrigger(getTrigger(store, { target, ...other }));
    };

    handleScroll(); // Re-evaluate trigger when dependencies change
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      //@ts-ignore
      target.removeEventListener("scroll", handleScroll, { passive: true });
    };
    // See Option 3. https://github.com/facebook/react/issues/14476#issuecomment-471199055
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, getTrigger, enabled, JSON.stringify(other)]);

  return trigger;
}
