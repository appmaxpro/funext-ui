import { create } from "zustand";
import type { DeviceSelector } from "~/utils/types";

export const useDeviceSelector = create<DeviceSelector>((set, get) => ({
  setAll() {
    set({ by: "*" });
  },
  setUniqueIds(uniqueIds: string[]) {
    set({ uniqueIds, by: "unique" });
  },
  setIds(ids: number[]) {
    set({ ids, by: "id" });
  },
  reset() {
    set({});
  },
  get: get
}));
