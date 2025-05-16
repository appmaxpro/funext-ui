import * as React from 'react'
import { Slide } from "@funext/ui";
import useScrollTrigger from "~/hooks/use-scroll-trigger";

export function HideOnScroll(props: {
  children: React.ReactElement;
  direction: 'up' | 'down';
  target?: Node | null;
  enabled?: boolean;
}) {
  const { children, direction, target, enabled = true } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target,
    enabled
  });
  console.log("HideOnScroll: trigger:", trigger)

  if (!enabled) {
    return children;
  }

  return <Slide direction={direction} appear={false} in={!trigger} timeout={500}>
    {children}
  </Slide>
}
