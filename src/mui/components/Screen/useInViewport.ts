import React, { useCallback, useEffect, useState } from "react";
import { useEnhancedEffect } from "../../hooks";
import debounce from "@mui/utils/debounce";

export function useInViewport<T extends HTMLElement = HTMLDivElement>(): {
  visible: boolean;
  ref: React.RefObject<T>;
} {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef<T>(null);

  useEnhancedEffect(() => {
    const { current } = ref;
    if (current && !visible) {
      function setVisibility(visibility: boolean) {
        if (ref.current) {
          setVisible(visibility);
        }
      }
      let requestFrame: number;
      const observer = new IntersectionObserver(([entry]) => {
        if(entry.target === ref.current){
          const visible = entry.isIntersecting;
          if (
            "requestAnimationFrame" in window &&
            "cancelAnimationFrame" in window
          ) {
            if (requestFrame) {
              cancelAnimationFrame(requestFrame);
            }
            requestFrame = requestAnimationFrame(() => setVisibility(visible));
          } else {
            debounce(() => setVisibility(visible), 300);
          }
        }
      });
      observer.observe(current);
      return () => {
        observer.unobserve(current);
        observer.disconnect();
      };
    }
  }, [visible]);

  return { visible, ref };
}
