import React from 'react';
import { create } from 'zustand'
import type { TrackerDevice, TrackerDevices } from '~/tracker/utils/types';

export type DeviceReducer = TrackerDevices & {
  refresh(action:TrackerDevice[]): void;
  update(action:TrackerDevice[]): void;
  selectId(selectedId:number) : void;
  selectIds(selectedIds:number[]): void;
  remove(id:number): void;
};

export const useDeviceStore = create<DeviceReducer>((set) => ({
  items: {},
  selectedId: null,
  selectedIds: [],
  refresh(action:TrackerDevice[]) {
    set((state) => {
      const items = {};
      action.forEach((item) => state.items[item.id] = item);
      return {items};
    })
  },
  update(action:TrackerDevice[]) {
    set((state) => {
      const items = {...state.items};
      action.forEach((item) => items[item.id] = item);
      return {items};
    })
  },
  
  selectId(selectedId:number) {
    set((state) => ({
      ...state, 
      selectedId, 
      selectedIds: selectedId ? [selectedId] : [],
      selectTime: Date.now(),
    }))
  },

  selectIds(selectedIds:number[]) {
    set((state) => ({
      ...state, 
      selectedIds, 
      selectedId: selectedIds[0],
      selectTime: Date.now(),
    }))
  },
  remove(id:number) {
    function remove(state:TrackerDevices){
      delete state.items[id];

      return state.items;
    }
    set((state) => ({
      ...state, 
      items: remove(state), 
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedIds: state.selectedIds.filter((anId) => anId !== id)
    }))
  },
}))

export const useDeviceStoreState = ()=> {
  const refresh = useDeviceStore((state) => state.refresh);
  const remove = useDeviceStore((state) => state.remove);
  const update = useDeviceStore((state) => state.update);
  const selectId = useDeviceStore((state) => state.selectId);
  const selectIds = useDeviceStore((state) => state.selectIds);
  //const refresh = useDeviceStore((state) => state.refresh);

  return React.useMemo(()=> ({
        refresh,
        remove,
        update,
        selectId,
        selectIds
  }), [refresh, remove, update, selectId, selectIds])

}

export const getDeviceLabel = (device: TrackerDevice) => device.name;
export const getDeviceKey = (device: TrackerDevice) => device.id;
export const deviceEquals= (d1: TrackerDevice, d2: TrackerDevice) => 
     d1 === d2 || d1.id === d2.id;
