import React, { MutableRefObject, useMemo } from "react";
import { useTheme, Breakpoint, Breakpoints } from "../../styles";
import { useMediaQuery } from "@mui/system";
import { useEnhancedEffect } from "../../hooks";
const breakpointKeys = ["xs", "sm", "md", "lg", "xl"];

export type ScreenSizeContextValue = {
  lgDown?: boolean;
  lgUp?: boolean;
  mdDown?: boolean;
  mdUp?: boolean;
  smDown?: boolean;
  smUp?: boolean;
  xlDown?: boolean;
  xlUp?: boolean;
  xsDown?: boolean;
  xsUp?: boolean;
  current?: Breakpoint;
  width?: number;
  up: (breakpoint: Breakpoint, inclusive?: boolean) => boolean;
  down: (breakpoint: Breakpoint, inclusive?: boolean) => boolean;
};

const ScreenSizeContext = React.createContext<ScreenSizeContextValue>({
  up: () => true,
  down: () => false,
});

export const isWidthUp = (
  breakpoints: Breakpoints,
  breakpoint: Breakpoint,
  width: Breakpoint | number,
  inclusive: boolean = true,
) => {
  if (typeof width === "number") {
    return inclusive
      ? breakpoints.values[breakpoint] <= width
      : breakpoints.values[breakpoint] < width;
  }

  return inclusive
    ? breakpointKeys.indexOf(breakpoint) <= breakpointKeys.indexOf(width)
    : breakpointKeys.indexOf(breakpoint) < breakpointKeys.indexOf(width);
};

// By default, returns true if screen width is less than the given breakpoint.
export const isWidthDown = (
  breakpoints: Breakpoints,
  breakpoint: Breakpoint,
  width: Breakpoint | number,
  inclusive: boolean = false,
) => {
  if (typeof width === "number") {
    return inclusive
      ? width <= breakpoints.values[breakpoint]
      : width < breakpoints.values[breakpoint];
  }

  return inclusive
    ? breakpointKeys.indexOf(width) <= breakpointKeys.indexOf(breakpoint)
    : breakpointKeys.indexOf(width) < breakpointKeys.indexOf(breakpoint);
};

function computeSize(
  width: number,
  oldWidth: number | undefined,
  breakpoints: Breakpoints,
) {
  if (oldWidth === width) {
    return;
  }
  let change = {
    width,
    up: (breakpoint: Breakpoint, inclusive: boolean = false) =>
      isWidthUp(breakpoints, breakpoint, width, inclusive),

    down: (breakpoint: Breakpoint, inclusive: boolean = false) =>
      isWidthDown(breakpoints, breakpoint, width, inclusive),
  };
  let current;
  for (let i = 0; i < breakpoints.keys.length; i += 1) {
    const breakpoint = breakpoints.keys[i];
    const breakpointUp = `${breakpoint}Up`;
    const breakpointDown = `${breakpoint}Down`;
    const isDown = isWidthDown(breakpoints, breakpoint, width!);
    Reflect.set(
      change,
      breakpointUp,
      isWidthUp(breakpoints, breakpoint, width!),
    );
    Reflect.set(change, breakpointDown, isDown);
    if (isDown) {
      current = breakpoint;
    }
  }
  Reflect.set(change, "current", current);
  return change;
}

let timeout: any;

export const ScreenSizeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const [value, setValue] = React.useState<ScreenSizeContextValue>({
    up: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    down: (breakpoint: Breakpoint, inclusive?: boolean) => true,
  });
  function getDimensions() {
    const newState = computeSize(
      window.innerWidth,
      value.width,
      theme.breakpoints,
    );
    if (newState) {
      setValue(newState);
      return;
    }
  }

  useEnhancedEffect(() => {
    const resize = function () {
      // clear the timeout
      clearTimeout(timeout);
      // start timing for event "completion"
      timeout = setTimeout(getDimensions, 250);
    };
    window.addEventListener("resize", resize);
    getDimensions();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={value}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

export function useContainerSize(ref: MutableRefObject<HTMLElement | null>) {
  const theme = useTheme();
  const [value, setValue] = React.useState<ScreenSizeContextValue>({
    up: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    down: (breakpoint: Breakpoint, inclusive?: boolean) => true,
  });

  function getDimensions(rect: DOMRectReadOnly) {
    const newState = computeSize(rect.width, value.width, theme.breakpoints);
    if (newState) {
      setValue(newState);
      return;
    }
  }

  useEnhancedEffect(() => {
    const { current } = ref;
    if (current == null) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === current) {
          getDimensions(entry.contentRect);
          break;
        }
      }
    });

    observer.observe(current);

    return () => {
      observer.unobserve(current);
      observer.disconnect();
    };
  }, [ref]);

  return value;
}

interface SuggestSize {
  xs?: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
  def: any;
}
export function useSuggestSize(
  ref: MutableRefObject<HTMLElement | null>,
  suggest: SuggestSize,
) {
  const container = useContainerSize(ref);
  const [value, setValue] = React.useState(suggest.def);

  React.useEffect(() => {
    if (container.current) {
      if (ref.current) {
        let index = breakpointKeys.indexOf(container.current);
        for (; index >= 0; index -= 1) {
          let bk = container.current as keyof typeof suggest;
          if (suggest[bk]) {
            setValue(suggest[bk]);
            return;
          }
        }
        if (value != suggest.def) {
          setValue(suggest.def);
        }
      }
    }
  }, [container]);
}

export const useScreenSize = () => React.useContext(ScreenSizeContext);
