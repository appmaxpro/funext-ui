import { useTrackerSession } from "../store/session";

const containsProperty = (object:any, key:string|symbol) => object.hasOwnProperty(key) && object[key] !== null;

export const usePreference = (key:string, defaultValue?:any) => useTrackerSession((state) => {
  const server = state.server;
  const user = state.user;
  if (server.forceSettings) {
    if (containsProperty(server, key)) {
      return server[key];
    }
    if (containsProperty(user, key)) {
      return user[key];
    }
    return defaultValue;
  }
  if (containsProperty(user, key)) {
    return user[key];
  }
  if (containsProperty(server, key)) {
    return server[key];
  }
  return defaultValue;
});

export const useAttrPref = (key:string, defaultValue?:any) => useTrackerSession((state) => {
  const server = state.server;
  const user = state.user;
  if (server.forceSettings) {
    if (containsProperty(server.attributes, key)) {
      return server.attributes[key];
    }
    if (containsProperty(user.attributes, key)) {
      return user.attributes[key];
    }
    return defaultValue;
  }
  if (containsProperty(user.attributes, key)) {
    return user.attributes[key];
  }
  if (containsProperty(server.attributes, key)) {
    return server.attributes[key];
  }
  return defaultValue;
});
