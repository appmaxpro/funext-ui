import { useIsomorphicLayoutEffect } from "framer-motion";
import React from "react";

export default function usePrevious<T>(value: T) {
  const ref = React.useRef<T | {}>({});

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}