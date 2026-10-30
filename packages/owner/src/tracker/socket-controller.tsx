import { Snackbar, useLazyRef } from "~/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import alarm from "~/assets/alarm.mp3";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { useCatchCallback } from "~/hooks/use-catch";
import { useSession } from "~/hooks/use-session";
import { snackBarDurationLongMs } from "~/utils/constant";
import { useDeviceStore, useDeviceStoreState } from "./store/devices";
import { useTrackerSession } from "./store/session";
import { useAttrPref } from "./utils/preferences";

import {
  handleNativeNotificationListeners,
  nativePostMessage,
} from "./utils/native-interface";

const logoutCode = 4000;

const SocketController = () => {
  //const navigate = useNavigate();
  const session = useSession();
  const sessionActions = useTrackerSession();
  const devicesActions = useDeviceStoreState();
  const devicesActionsRef = useRef(devicesActions);
  const authenticated =
    useTrackerSession((state) => Boolean(state.user)) && !!session.data?.user;
  const includeLogs = useTrackerSession((state) => state.includeLogs);

  const socketRef = useRef<WebSocket>(null);
  const reconnectTimeoutRef = useRef<number>(null);

  devicesActionsRef.current = devicesActions;

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  const soundEvents = useAttrPref("soundEvents", "");
  const soundAlarms = useAttrPref("soundAlarms", "sos");
  const isEnabled = !!session.data?.features?.tracker;

  const isWsEnabled = isEnabled && session.data!.features!.tracker!.socket;
  //const features = useFeatures();

  const handleEvents = useCallback(
    (events: any) => {
      /*
      if (!features.disableEvents) {
        eventsActions.add(events);
      }*/
      if (
        events.some(
          (e: any) =>
            soundEvents.includes(e.type) ||
            (e.type === "alarm" && soundAlarms.includes(e.attributes.alarm)),
        )
      ) {
        new Audio(alarm).play();
      }
      setNotifications(
        events.map((event: any) => ({
          id: event.id,
          message: event.attributes.message,
          show: true,
        })),
      );
    },
    [soundEvents, soundAlarms],
  );

  const connectSocket = () => {
    if (!isWsEnabled) {
      return;
    }
    clearReconnectTimeout();
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close();
    }
    const tracker = session.data!.features!.tracker!;

    let { domain, token } = tracker;
    const protocol = domain.startsWith("https:") ? "wss:" : "ws:";
    domain = domain.substring(
      domain === "wss" ? "https://".length : "http://".length,
    );
    const search = new URLSearchParams({ token: tracker.token });
    const socket = new WebSocket(
      `${protocol}//${domain}/api/socket?${search.toString()}`,
      [token],
    );
    socketRef.current = socket;

    socket.onopen = () => {
      sessionActions.updateSocket(true);
    };

    socket.onclose = async (event) => {
      sessionActions.updateSocket(false);
      if (event.code !== logoutCode) {
        //loadPositions(false);
        clearReconnectTimeout();
        //@ts-ignore
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectSocket();
        }, 60000);
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.devices) {
        devicesActionsRef.current.update(data.devices);
      }
      if (data.positions) {
        sessionActions.updatePositions(data.positions);
      }
      if (data.events) {
        handleEvents(data.events);
      }
      if (data.logs) {
        sessionActions.updateLogs(data.logs);
      }
    };
  };

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    socketRef.current?.send(JSON.stringify({ logs: includeLogs }));
  }, [includeLogs]);

  useAsyncEffect(async () => {
    if (!isEnabled) {
      return;
    }
    if (authenticated) {
      nativePostMessage("authenticated");
      connectSocket();
      return () => {
        clearReconnectTimeout();
        socketRef.current?.close(logoutCode);
      };
    }
  }, [authenticated]);

  const handleNativeNotification = useCatchCallback(
    async (message) => {
      const eventId = message.data.eventId;
      if (eventId) {
        const tracker = session.data?.features?.tracker;

        if (!tracker) {
          return;
        }
        let { domain, token } = tracker;
        const response = await fetch(`${domain}/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const event = await response.json();
          const eventWithMessage = {
            ...event,
            attributes: {
              ...event.attributes,
              message: message.notification.body,
            },
          };
          handleEvents([eventWithMessage]);
        }
      }
    },
    [handleEvents],
  );

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    handleNativeNotificationListeners.add(handleNativeNotification);
    return () => {
      handleNativeNotificationListeners.delete(handleNativeNotification);
    };
  }, [handleNativeNotification]);

  useEffect(() => {
    if (!isWsEnabled) {
      return;
    }
    if (!authenticated) return;
    const reconnectIfNeeded = () => {
      const socket = socketRef.current;
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        connectSocket();
      } else if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send("{}");
        } catch {
          // test connection
        }
      }
    };
    const onVisibility = () => {
      if (!document.hidden) {
        reconnectIfNeeded();
      }
    };
    window.addEventListener("online", reconnectIfNeeded);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("online", reconnectIfNeeded);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [authenticated]);

  return (
    <>
      {notifications.map((notification: any) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={snackBarDurationLongMs}
          onClose={() =>
            setNotifications(
              notifications.filter((e) => e.id !== notification.id),
            )
          }
        />
      ))}
    </>
  );
};

export default SocketController;
