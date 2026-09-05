import debounce from "@mui/utils/debounce";

export function useRequestAnimationFrame() {
  let requestFrame: number;
  let timeoutLast: any;
  return (cb: () => void, timeout: number = 0) => {
    if ("requestAnimationFrame" in window && "cancelAnimationFrame" in window) {
      if (requestFrame) {
        cancelAnimationFrame(requestFrame);
      }
      requestFrame = requestAnimationFrame(cb);
    } else {
      if (timeoutLast) {
        clearTimeout(timeoutLast);
      }
      timeoutLast = setTimeout(cb, timeout);
    }

    return () => {
      if (requestFrame) {
        cancelAnimationFrame(requestFrame);
      }
      if (timeoutLast) {
        clearTimeout(timeoutLast);
      }
    };
  };
}
