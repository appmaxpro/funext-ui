
export interface TrackerDevice{
  id: number;
  name: string;
  category?: string;
  status: string;
  uniqueId: string;
  attributes: any;
  lastUpdate?: string;
  positionId?: number;
  phone?: string;
  model?: string;
  contact?: string;
  disabled?: boolean;
  expirationTime?: string;
  driverId: null;
  currentOrderId: null;
  workingStatus?: string;
  payload?: {
    currentTripId?: string|number;
    tripNumber?: string;
    driver?: object;
    info?: string;
    last?: number;
    status?: object;
    state?: string;
  }
}

export interface TrackerDevices{
  items: Record<number, TrackerDevice>;
  selectedId?: number|null;
  selectedIds: number[];
  selectTime?: number;
  count: number;
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