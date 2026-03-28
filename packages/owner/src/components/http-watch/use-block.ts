import type { SetStateAction } from "react";

import { create } from 'zustand'

export type Blocker = {
  count: number,
  get blocked(): boolean;
  set(state: SetStateAction<boolean>): any;
};


const useBlockerStore = create<Blocker>((set, get) => ({
  count: 0,
  get blocked(){return get().count > 0},
  set(state){
    const block = typeof state === "function" ? state(get().blocked) : state;
    set((state) => ({count: block ? state.count + 1 : state.count - 1}));
  }
}))


function wait(ms?: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function block<T>(
  task: () => T,
  ms?: number,
): Promise<Awaited<T>> {
  const set = useBlockerStore((state) => state.set);
  try {
    set( true);
    await wait(ms);
    return await task();
  } finally {
    set(false);
  }
}

export const useHttpBlock = useBlockerStore;
