import { create } from "zustand";

interface TrackerSession {
  server: any;
  user: any;
  socket: any;
  positions: Record<number, any>;
  history: Record<number, any[]>;
  includeLogs: boolean;
  logs: any[];
  posCount: number;
  readonly deviceIds?: string[] | null;
  updateServer(server: any): void;
  updateUser(user: any): void;
  updateSocket(socket: any): void;
  updatePositions(positions: any[]): void;
  updateLogs(logs: any[]): void;
  setDevices(deviceIds?: string[] | null): void;
  reset(): void;
}
const init = ()=> ({
  server: {
        attributes: {},
      },
      user: {
        attributes: {},
      },
      deviceIds: null,
      socket: null,
      includeLogs: false,
      logs: [],
      posCount: 0,
      positions: {},
      history: {},
})

export const useTrackerSession = create<TrackerSession>((set) => ({
  ...init(),
  reset() {
    set(init());
  },
  updateLogs(logs) {
    set((state) => ({ ...state, logs }));
  },
  updateServer(server) {
    set((state) => ({ ...state, server }));
  },
  updateUser(user) {
    set({ ...init(), user });
  },
  updateSocket(socket) {
    set((state) => ({ ...state, socket }));
  },
  updatePositions(positions: any[]) {
    set((state) => {
      const newPositions = { ...state.positions };
      const liveRoutes =
        state.user.attributes.mapLiveRoutes ||
        state.server.attributes.mapLiveRoutes ||
        "none";
      const liveRoutesLimit =
        state.user.attributes["web.liveRouteLength"] ||
        state.server.attributes["web.liveRouteLength"] ||
        10;

      positions.forEach((position) => {
        newPositions[position.deviceId] = position;
        if (liveRoutes !== "none") {
          const route = state.history[position.deviceId] || [];
          const last = route.at(-1);
          if (
            !last ||
            (last[0] !== position.longitude && last[1] !== position.latitude)
          ) {
            state.history[position.deviceId] = [
              ...route.slice(1 - liveRoutesLimit),
              [position.longitude, position.latitude],
            ];
          }
        }
      });

      return {
        ...state,
        positions: newPositions,
        posCount: Object.keys(newPositions).length,
        history: liveRoutes !== "none" ? state.history : {},
      };
    });
  },
  setDevices(deviceIds?: string[] | null) {
    set((state) => {
      return {
        ...state,
        deviceIds,
      };
    });
  },
}));
