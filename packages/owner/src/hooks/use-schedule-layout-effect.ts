import React from "react";
import { useLayoutEffect } from "./use-layout-effect";
import { useLazyRef } from "~/ui";

/** Imperatively run a function on the next layout effect cycle. */
export const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<object>();
  const fns = useLazyRef(() => new Map<string | number, () => void>());

  useLayoutEffect(() => {
    fns.current.forEach((f) => f());
    fns.current = new Map();
  }, [s]);

  return (id: string | number, cb: () => void) => {
    fns.current.set(id, cb);
    ss({});
  };
};