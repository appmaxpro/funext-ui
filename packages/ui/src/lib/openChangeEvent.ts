import type { OpenChangeReason } from "@floating-ui/react";

type OnOpenChange = (
  open: boolean,
  event?: Event,
  reason?: OpenChangeReason,
) => void;

export function onOpenChangeEvent({
  onOpenChange,
  onClose,
}: {
  onOpenChange?: OnOpenChange;
  onClose?: () => void;
}): OnOpenChange {
  return (open: boolean, event?: Event, reason?: OpenChangeReason) => {
    onClose?.();
    onOpenChange?.(open, event, reason);
  };
}
