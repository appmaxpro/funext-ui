import React from 'react';
import { create } from 'zustand'
import type { TrackerDevice, TrackerDevices } from '~/tracker/utils/types';

export type DeviceReducer = TrackerDevices & {
  readonly uIDs: string[];
  refresh(action:TrackerDevice[]): void;
  update(action:TrackerDevice[]): void;
  selectId(selectedId:number) : void;
  selectIds(selectedIds:number[]): void;
  remove(id:number): void;
  setUIds(uids: string[]): void;
};

export const useDeviceStore = create<DeviceReducer>((set) => ({
  items: {},
  selectedId: null,
  selectedIds: [],
  uIDs: [],
  count: 0,
  refresh(action:TrackerDevice[]) {
    const items = {} as Record<number, TrackerDevice>;
    action.forEach((item) => items[item.id] = item); 
    set({selectedId: null, selectedIds: [], items, count: action.length})
    
  },
  update(action:TrackerDevice[]) {
    set((state) => {
      const items = {...state.items};
      action.forEach((item) => items[item.id] = item);
      return {...state, items};
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
      const items = {...state.items};
      delete items[id];

      return {items, count: Object.keys(items).length}
    }
    set((state) => ({
      ...state, 
      ...remove(state), 
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedIds: state.selectedIds.filter((anId) => anId !== id)
    }))
  },
  setUIds(uIDs: string[]) {
    set((state) => ({
      ...state, 
      items: [], 
      selectedId: undefined,
      selectedIds: [],
      uIDs
    }))
  }
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
