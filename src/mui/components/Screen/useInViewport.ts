import React, { useCallback, useEffect, useState } from "react";
import { useEnhancedEffect } from "../../hooks";
import debounce from "@mui/utils/debounce";

const callbackDebounce = debounce(function(cb: () => void) {
   
}, 300);

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
      const hasIOSupport = !!window.IntersectionObserver
      if (!hasIOSupport) {
        setVisible(true);
        return
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
            callbackDebounce(() => setVisibility(visible));
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
