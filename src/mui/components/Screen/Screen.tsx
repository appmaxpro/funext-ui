import React, { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useTheme, Breakpoint, Breakpoints } from "../../styles";
import { debounce} from "../../utils";
import { useMediaQuery } from "@mui/system";
import { useEnhancedEffect } from "../../hooks";
const breakpointKeys = ["xs", "sm", "md", "lg", "xl"];
const resizeDebounce = debounce((fn)=> fn(), 200);

export type SizeContextValue = {
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
  height?: number;
  up: (breakpoint: Breakpoint, inclusive?: boolean) => boolean;
  down: (breakpoint: Breakpoint, inclusive?: boolean) => boolean;
  valid: boolean;
};

const ScreenSizeContext = React.createContext<SizeContextValue>({
  up: () => true,
  down: () => false,
  valid: false
});

const ContainerSizeContext = React.createContext<SizeContextValue>({
  up: () => true,
  down: () => false,
  valid: false
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
  let change:SizeContextValue = {
    width,
    up: (breakpoint: Breakpoint, inclusive: boolean = false) =>
      isWidthUp(breakpoints, breakpoint, width, inclusive),

    down: (breakpoint: Breakpoint, inclusive: boolean = false) =>
      isWidthDown(breakpoints, breakpoint, width, inclusive),
    valid: true
  };
  let current;
  for (let i = 0; i < breakpoints.keys.length; i += 1) {
    const breakpoint = breakpoints.keys[i];
    const breakpointUp = `${breakpoint}Up`;
    const breakpointDown = `${breakpoint}Down`;
    const isDown = isWidthDown(breakpoints, breakpoint, width!);
    const isUp = isWidthUp(breakpoints, breakpoint, width!);
    Reflect.set(
      change,
      breakpointUp,
      isUp,
    );
    Reflect.set(change, breakpointDown, isDown);
    if (isUp) {
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
  const [value, setValue] = React.useState<SizeContextValue>({
    up: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    down: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    valid: false
  });
  function getDimensions() {
    const newState = computeSize(
      window.innerWidth,
      value.width,
      theme.breakpoints,
    );
    if (newState) {
      newState.height = window.innerHeight;
      setValue(newState);
      return;
    }
    else if(window.innerHeight != value.height){
      value.height = window.innerHeight;
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


export function useResizeDetectorRef<T extends HTMLElement = HTMLDivElement>(withHeight?:boolean, debugId?: string) {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((nodeElement: T | null) => {
    setNode(nodeElement);
  }, []);

  const size = useResizeDetector<T>(node, withHeight, );
  return {ref, size, node}
}

export function useResizeDetector<T extends HTMLElement = HTMLDivElement>(
  ref: MutableRefObject<T | null> | T | null,
  withHeight?:boolean,
  debugId?: string
): SizeContextValue {
  const parent = useContainerSize();
  const theme = useTheme();
  const [value, setValue] = React.useState<SizeContextValue>({
    up: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    down: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    valid: false
  });

  function getDimensions(rect: DOMRectReadOnly) {
    const newState = computeSize(rect.width, value.width, theme.breakpoints);
    
    if (newState) {
      newState.height = rect.height;
      //console.log("useResizeDetector: change:", debugId, ", newState:", newState)
      
      setValue(newState);
      return;
    } 
    else if (withHeight) {
      if (rect.height != value.height) {

        //console.log("useResizeDetector: change height:", rect.height)
        setValue({...value, height: rect.height});  
      }
    }
    else if (rect.height != value.height) {
      value.height = rect.height;
    }
  }

  useEffect(() => {
    const current  = ref instanceof HTMLElement ? ref : ref?.current;
    
    if (current == null) {
      if(debugId)
          console.warn("useResizeDetector:", debugId, " has no element\nParent:", parent);
      return;
    }
    
    const observer = new ResizeObserver((entries) => {
      resizeDebounce(()=> {
        for (const entry of entries) {
          if (entry.target === current) {
            getDimensions(entry.contentRect);
            //console.log("useResizeDetector: resize:", entry.contentRect, "\nclientRect:", current.getBoundingClientRect(), "\ntarget:", current)
           // break;
          }
        }
      })
      
    });

    observer.observe(current);
    getDimensions(current.getBoundingClientRect())
    //console.log("useResizeDetector: connect:", current);
    return () => {
      observer.unobserve(current);
      observer.disconnect();
      //console.log("useResizeDetector: disconnect:", current);
    };
  }, [ref]);

  useEnhancedEffect(() => {
    const current  = ref instanceof HTMLElement ? ref : ref?.current;
    if (!value.valid && parent?.valid) {
      //console.warn("useResizeDetector:", debugId, " try to set parent\nParent:", parent);
    }
    if (current && !value.valid && parent?.valid) {
        setValue(parent);
    }
  }, [ref, parent, value])

  return value;
}

export const ContainerSizeProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SizeContextValue;
}) => {
  return (
    <ContainerSizeContext.Provider value={value}>
      {children}
    </ContainerSizeContext.Provider>
  );
};

export const useScreenSize = () => React.useContext(ScreenSizeContext);
export const useContainerSize = () =>
  React.useContext(ContainerSizeContext);

interface SuggestSize {
  xs?: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
  def: any;
}

export function useSuggestItemSize(suggest: SuggestSize) {
  const container = useContainerSize();
  const [value, setValue] = React.useState(suggest.def);

  React.useEffect(() => {
    if (container.current) {
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
  }, [container]);
}
