import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import debounce from "@mui/utils/debounce";

const callbackDebounce = debounce(function (cb: () => void) {}, 200);

export function useInViewport<T extends HTMLElement = HTMLDivElement>(
  debugId?: string,
) {
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((nodeElement: T | null) => {
    setNode(nodeElement);
  }, []);

  const visible = useInViewportWithRef(node, debugId);
  return { ref, visible, node };
}

export function useInViewportWithRef<T extends HTMLElement = HTMLDivElement>(
  node: MutableRefObject<T | null> | T | null,
  debugId?: string,
): boolean {
  const [visible, setVisible] = useState(false);
  

  useEffect(() => {
    console.log("useInViewport: for:", debugId, ", element:", node);
    const element = node instanceof HTMLElement ? node : node?.current;
    if (element) {
      function setVisibility(visibility: boolean) {
        if ((node instanceof HTMLElement ? node : node?.current)) {
          setVisible(visibility);
        }
      }
      const hasIOSupport = !!window.IntersectionObserver;
      if (!hasIOSupport) {
        setVisible(true);
        return;
      }

      let requestFrame: number;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.target === element) {
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
      observer.observe(element);
      return () => {
        observer.unobserve(element);
        observer.disconnect();
      };
    }
  }, [node, setVisible]);

  return visible;
}

