import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTheme, Breakpoint, Breakpoints } from "../../styles";
import { debounce, EXCLUDE_CHILDREN, shallowEqual } from "../../utils";
import { useMediaQuery } from "@mui/system";
import { useEnhancedEffect } from "../../hooks";
const breakpointKeys = ["xs", "sm", "md", "lg", "xl"];
const resizeDebounce = debounce((fn) => fn(), 200);

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
  target?: HTMLElement;
};

const ScreenSizeContext = React.createContext<SizeContextValue>({
  up: () => true,
  down: () => false,
  valid: false,
});

const ContainerSizeContext = React.createContext<SizeContextValue>({
  up: () => true,
  down: () => false,
  valid: false,
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
  let change: SizeContextValue = {
    width,
    up: (breakpoint: Breakpoint, inclusive: boolean = false) =>
      isWidthUp(breakpoints, breakpoint, width, inclusive),

    down: (breakpoint: Breakpoint, inclusive: boolean = true) =>
      isWidthDown(breakpoints, breakpoint, width, inclusive),
    valid: true,
  };
  let current;
  for (let i = 0; i < breakpoints.keys.length; i += 1) {
    const breakpoint = breakpoints.keys[i];
    const breakpointUp = `${breakpoint}Up`;
    const breakpointDown = `${breakpoint}Down`;
    const isDown = isWidthDown(breakpoints, breakpoint, width!);
    const isUp = isWidthUp(breakpoints, breakpoint, width!);
    Reflect.set(change, breakpointUp, isUp);
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
    valid: false,
  });
  function getDimensions() {
    let cValue: SizeContextValue = value;
    setValue((state) => {
      cValue = state;
      return state;
    });
    const newState = computeSize(
      window.innerWidth,
      cValue.width,
      theme.breakpoints,
    );
    if (newState) {
      newState.height = window.innerHeight;
      setValue(newState);
      return;
    } else if (window.innerHeight != cValue.height) {
      cValue.height = window.innerHeight;
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
    return () => {
      window.removeEventListener("resize", resize);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ScreenSizeContext.Provider value={value}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

export function useResizeDetectorRef<T extends HTMLElement = HTMLDivElement>(
  withHeight?: boolean,
  debugId?: string,
) {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((nodeElement: T | null) => {
    setNode(nodeElement);
  }, []);

  const size = useResizeDetector<T>(node, withHeight, debugId);
  return { ref, size, node };
}

export function useResizeDetector<T extends HTMLElement = HTMLDivElement>(
  ref: MutableRefObject<T | null> | T | null,
  withHeight?: boolean,
  debugId?: string,
): SizeContextValue {
  const parent = useContainerSize();
  const theme = useTheme();
  const [value, setValue] = React.useState<SizeContextValue>({
    up: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    down: (breakpoint: Breakpoint, inclusive?: boolean) => true,
    valid: false,
  });

  const resizeDebounce = React.useRef(debounce((fn) => fn(), 400)).current;

  function getDimensions(rect: DOMRectReadOnly, target: HTMLElement) {
    let cValue: SizeContextValue = value;
    setValue((state) => {
      cValue = state;
      return state;
    });
    
    const newState = computeSize(rect.width, cValue.width, theme.breakpoints);
    /*
    if (debugId)
      console.log(
        "useResizeDetector: change:",
        debugId,
        ", newState:",
        newState,
        ", changed:",
        (newState || (withHeight && rect.height != cValue.height)) && true,
        ", oldWidth:",
        cValue.width,
      );*/

      
    if (newState) {
      newState.height = rect.height;
      newState.target = target;

      setValue(newState);
      return;
    } else if (withHeight) {
      if (rect.height != cValue.height) {
        //console.log("useResizeDetector: change height:", rect.height)
        setValue({ ...cValue, height: rect.height, target });
      }
    } else if (rect.height != value.height) {
      cValue.height = rect.height;
      cValue.target = target;
    }
  }

  //const resizeDebounce = React.useRef(debounce(

  useEffect(() => {
    const current = ref instanceof HTMLElement ? ref : ref?.current;

    if (current == null) {
      if (debugId)
        console.warn(
          "useResizeDetector:",
          debugId,
          " has no element\nParent:",
          parent,
        );
      return;
    }

    const observer = new ResizeObserver((entries) => {
      resizeDebounce(() => {
        for (const entry of entries) {
          if (entry.target === current) {
            getDimensions(entry.contentRect, entry.target as HTMLElement);

            //console.log("useResizeDetector: resize:", entry.contentRect, "\nclientRect:", current.getBoundingClientRect(), "\ntarget:", current)
            // break;
          }
        }
      });
    });

    observer.observe(current);
    getDimensions(current.getBoundingClientRect(), current);
    //console.log("useResizeDetector: connect:", current);
    return () => {
      observer.unobserve(current);
      observer.disconnect();
      //console.log("useResizeDetector: disconnect:", current);
    };
  }, [ref]);

  useEnhancedEffect(() => {
    const current = ref instanceof HTMLElement ? ref : ref?.current;
    if (!value.valid && parent?.valid) {
      //console.warn("useResizeDetector:", debugId, " try to set parent\nParent:", parent);
    }
    if (current && !value.valid && parent?.valid) {
      setValue(parent);
    }
  }, [ref, parent, value]);

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
export const useContainerSize = () => React.useContext(ContainerSizeContext);

interface SuggestSize<T = any> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  def: T;
  all?: any;
}

type SuggestSizeResult<T = any> = {
  suggest: keyof SuggestSize;
  size?: SizeContextValue;
  value?: T;
};


const merge = (a1?:any, a2?: any) => {
  if (!a1 || !a2) return a1 || a2;
  if (typeof a1 === 'object' && a2 === 'object') {
    return {...a1, ...a2}
  }
  return a1;
}
export function getSuggestSize<T = any>(
  suggest: SuggestSize<T>,
  size: SizeContextValue,
): SuggestSizeResult<T> {
  if (size.current) {
    let index = breakpointKeys.indexOf(size.current);
    let bk = size.current as keyof typeof suggest;
    if (bk in suggest) {
      const val =  merge(suggest[bk], suggest.all);
      return {
        suggest: bk,
        size: size,
        value: val ? merge(val, suggest.all) : val,
      };
    }

    for (; index > 0; index -= 1) {
      bk = breakpointKeys[index - 1] as keyof typeof suggest;
      if (bk in suggest) {
        const val =  merge(suggest[bk], suggest.all);
        return {
          suggest: bk,
          size,
          value: val ? merge(val, suggest.all) : val,
        };
      }
    }
  }
  
  return {
    suggest: "def",
    value: suggest.def ? merge(suggest.def, suggest.all) : suggest.def,
    size
  };
}

function useSuggestSize<T = any>(
  sizeHook: () => SizeContextValue,
  suggest: SuggestSize<T>,
) {
  const size = sizeHook();

  const [value, setValue] = React.useState<SuggestSizeResult>(() => {
    return getSuggestSize(suggest, size);
  });

  React.useEffect(() => {
    const result = getSuggestSize(suggest, size);
    setValue((state) => {
      if (state.suggest !== result.suggest || state.size !== result.size) {
        return result;
      }
      return state;
    });
  }, [size]);

  return value;
}

export function useSuggestContainer<T = any>(suggest: SuggestSize<T>) {
  return useSuggestSize(useContainerSize, suggest);
}

export function useSuggestScreen<T = any>(suggest: SuggestSize<T>) {
  return useSuggestSize(useScreenSize, suggest);
}

const call = (fn: any, a1:any, a2?: any) => {
  if (!a2)
    return fn(a1);

  return fn(a2, a1);
}
export interface IfSizeResult<
  T extends React.ComponentType = any,
  P extends React.ComponentProps<T> = any,
> {
  component: T;
  props: P;
}

export interface IfSizeProps<T extends IfSizeResult> {
  suggest: SuggestSize<T>;
  type?: "screen" | "box";
  input?: any;
  params?: any;
}

export function IfSize<T extends IfSizeResult>({
  type,
  suggest,
  input,
  params
}: IfSizeProps<T>) {
  const result = useSuggestSize(
    type === "screen" ? useScreenSize : useContainerSize,
    suggest!,
  );

  const [output, setOutput] = React.useState<IfSizeResult>();

  React.useEffect(() => {
    const val = result.value;
    if (val !== undefined && val !== null) {
      const output =
        typeof val === "function" ? call(val, result, merge(params, suggest.all)) : val;
            
      setOutput((state: any) => {
        if (!shallowEqual(state, output, EXCLUDE_CHILDREN)) {
          return output;
        }
        return state;
      });
    } else {
      setOutput(undefined);
    }
  }, [result, params]);

  const props = React.useMemo(()=> (merge(output?.props, input)), [output, input])

  if (output) {
    return <output.component {...props} />;
  }
  return null;
}
