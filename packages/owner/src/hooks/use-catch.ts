import React from "react";
import { useErrorStore } from "../store/errors";

export const useCatch = ( method: (...args:any[]) => Promise<any>) => {
  const push = useErrorStore((state) => state.push);
  return (...args:any[]) => {
    method(...args).catch((error) => push(error.message));
  };
};

export const useCatchCallback = (method:(...args:any[])=> Promise<any>, deps:React.DependencyList) => {
  return React.useCallback(useCatch(method), deps);
};