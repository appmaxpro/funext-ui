import { useSyncExternalStore } from 'react';

export type Subscriber<Value> = (value: Value) => void;
type SetStateCallback<Value> = (value: Value) => Value;

export interface Store<Value> {
  getState: () => Value;
  setState: (value: Value | SetStateCallback<Value>) => void;
  updateState: (value: Value | SetStateCallback<Value>) => void;
  initialize: (value: Value) => void;
  subscribe: (callback: Subscriber<Value>) => () => void;
}

export type StoreValue<S extends Store<any>> = ReturnType<S['getState']>;

export function createStore<Value extends Record<string, any>>(
  initialState: Value
): Store<Value> {
  let state = initialState;
  let initialized = false;
  const listeners = new Set<Subscriber<Value>>();

  return {
    getState() {
      return state;
    },

    updateState(value) {
      state = typeof value === 'function' ? value(state) : value;
    },

    setState(value) {
      const old = state;
      this.updateState(value);
      if (old !== state)
        listeners.forEach((listener) => listener(state));
    },

    initialize(value) {
      if (!initialized) {
        state = value;
        initialized = true;
      }
    },

    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

export function useStore<S extends Store<any>>(store: S) {
  return useSyncExternalStore<StoreValue<S>>(
    store.subscribe,
    () => store.getState(),
    () => store.getState()
  );
}