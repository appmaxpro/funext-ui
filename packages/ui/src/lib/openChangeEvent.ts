import type { OpenChangeReason } from "@floating-ui/react";
import { useEventCallback, useEvent } from "../hooks";
import { noop } from "../utils";

type OnOpenChange = (
  open: boolean,
  event?: Event,
  reason?: OpenChangeReason,
) => void;

export function onOpenChangeEvent(
  onOpenChange?: OnOpenChange,
  onClose?: () => void
): OnOpenChange {
  const onOpenChangeFn = useEvent(onOpenChange)
  const onCloseFn = useEvent(onClose)
  return useEvent((open: boolean, event?: Event, reason?: OpenChangeReason) => {
    if (!open)
        onCloseFn();
    onOpenChangeFn(open, event, reason);
  });
}
/*
export function useOpenChange(
  first?: OnOpenChange,
  second?: OnOpenChange,
): OnOpenChange {
  const firstFn = useEvent(first)
  const secondFn = useEvent(second)
  return useEvent((open: boolean, event?: Event, reason?: OpenChangeReason) => {
    firstFn(open, event, reason);
    secondFn(open, event, reason);
  });
}
  */
