import { useInViewContext } from "@funext/ui";
import React from "react";


export function useVisibility() {
  const {hasVisible, visible:nowVisible} = useInViewContext();
  const [visible, setVisible] = React.useState(hasVisible || nowVisible);
  React.useEffect(
    () => setVisible(hasVisible || nowVisible), 
    [hasVisible || nowVisible || visible]
  )

  return visible;
}