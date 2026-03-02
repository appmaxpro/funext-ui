import { create } from "zustand";


interface TrackerSession {
  server: any;
  user: any;
  socket: any;
  positions: Record<number,any>;
  history: Record<number,any[]>;
  includeLogs: boolean;
  logs: any[];
  updateServer(server:any): void;
  updateUser(user:any): void;
  updateSocket(socket:any): void;
  updatePositions(positions: any[]) : void;
  updateLogs(logs: any[]): void; 
}

export const useTrackerSession = create<TrackerSession>((set) => ({
  server: {
    attributes: {

    }
  },
  user: {
    attributes: {
      
    }
  },
  socket: null,
  includeLogs: false,
  logs: [],
  positions: {},
  history: {},
  updateLogs(logs) {
    set((state) => ({...state, logs}))
  },
  updateServer(server) {
    set((state) => ({...state, server}))
  },
  updateUser(user) {
    set((state) => ({...state, user}))
  },
  updateSocket(socket) {
    set((state) => ({...state, socket}))
  },
  updatePositions(positions: any[]) {
    set((state) => {

      const liveRoutes =
        state.user.attributes.mapLiveRoutes ||
        state.server.attributes.mapLiveRoutes ||
        "none";
      const liveRoutesLimit =
        state.user.attributes["web.liveRouteLength"] ||
        state.server.attributes["web.liveRouteLength"] ||
        10;
       
      positions.forEach((position) => {
        state.positions[position.deviceId] = position;
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
        history: liveRoutes !== "none" ? state.history : {},
      }
    });
  },
}));
