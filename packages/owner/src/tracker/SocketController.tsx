import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Snackbar } from '@funext/ui';
import alarm from './resources/alarm.mp3';
import { useAttributePreference } from './utils/preferences';
import { useTrackerSession } from './store/session';
import { useDeviceStore, useDeviceStoreState } from './store/devices';
import { i18n } from '~/utils/i18n';
import { useAsyncEffect } from '~/hooks/use-async-effect';
import { snackBarDurationLongMs } from '~/utils/constant';

const logoutCode = 4000;

const SocketController = () => {
  const navigate = useNavigate();
  const t = i18n.get;

  const authenticated = useTrackerSession((state) => !!state.user);
  const devices = useDeviceStore((state) => state.items);
  const includeLogs = useTrackerSession((state) => state.includeLogs);
  const sessionActions = useTrackerSession((state) => state);

  

  const deviceActions = useDeviceStoreState();

  const socketRef = useRef<WebSocket>();

  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const soundEvents = useAttributePreference('soundEvents', '');
  const soundAlarms = useAttributePreference('soundAlarms', 'sos');

  //const features = useFeatures();

  const connectSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/tracker/socket`);
    socketRef.current = socket;

    socket.onopen = () => {
      sessionActions.updateSocket(socket)
    };

    socket.onclose = async (event) => {
      sessionActions.updateSocket(null);
      if (event.code !== logoutCode) {
        try {
          const devicesResponse = await fetch('/tracker/devices');
          if (devicesResponse.ok) {
            deviceActions.update(await devicesResponse.json());
          }
          const positionsResponse = await fetch('/tracker/positions');
          if (positionsResponse.ok) {
            sessionActions.updatePositions(await positionsResponse.json());
          }
          if (devicesResponse.status === 401 || positionsResponse.status === 401) {
            navigate('/auth/login');
          }
        } catch (error) {
          // ignore errors
        }
        setTimeout(() => connectSocket(), 60000);
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.devices) {
        deviceActions.update(data.devices);
      }
      if (data.positions) {
        sessionActions.updatePositions(data.positions);
      }
      /*
      if (data.events) {
        if (!features.disableEvents) {
          dispatch(eventsActions.add(data.events));
        }
        setEvents(data.events);
      }*/
      if (data.logs) {
        sessionActions.updateLogs(data.logs);
      }
    };
  };

  useEffect(() => {
    socketRef.current?.send(JSON.stringify({ logs: includeLogs }));
  }, [socketRef, includeLogs]);

  useAsyncEffect(async () => {
    if (authenticated) {
      const response = await fetch('/tracker/devices');
      if (response.ok) {
        deviceActions.refresh(await response.json());
      } else {
        throw Error(await response.text());
      }
      connectSocket();
      return () => {
        const socket = socketRef.current;
        if (socket) {
          socket.close(logoutCode);
        }
      };
    }
    //return null;
  }, [authenticated]);

  useEffect(() => {
    setNotifications(events.map((event) => ({
      id: event.id,
      message: event.attributes.message,
      show: true,
    })));
  }, [events, devices, t]);

  useEffect(() => {
    events.forEach((event) => {
      if (soundEvents.includes(event.type) || (event.type === 'alarm' && soundAlarms.includes(event.attributes.alarm))) {
        new Audio(alarm).play();
      }
    });
  }, [events, soundEvents, soundAlarms]);

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={snackBarDurationLongMs}
          onClose={() => setEvents(events.filter((e) => e.id !== notification.id))}
        />
      ))}
    </>
  );
};

export default SocketController
//export default connect()(SocketController);
