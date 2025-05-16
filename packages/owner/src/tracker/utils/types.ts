
export interface TrackerDevice{
  id: number;
  name: string;
  category?: string;
  status: string;
  uniqueId: string;
}

export interface TrackerDevices{
  items: Record<number, TrackerDevice>;
  selectedId?: number|null;
  selectedIds: number[];
  selectTime?: number;
}

export type Position = {
  id: number;
  deviceId: TrackerDevice['id'];
  latitude: number;
  longitude: number;
  fixTime: number;
  course: number;
  attributes: any;
}