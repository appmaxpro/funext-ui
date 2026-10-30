import ReplayIcon from '@funext/icons/Replay';
import { useEffect, useRef, useState } from 'react';


import { Alert, IconButton } from "~/ui";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { useSession } from "~/hooks/use-session";
import { useTrackerSession } from "./store/session";
import { Loader } from '~/components';
import { useDeviceStore, useDeviceStoreState } from './store/devices';
import SocketController from './socket-controller';

const ServerProvider = ({ children }:{children:any}) => {
  const {data} = useSession();
  //const sessionActions = useTrackerSession()
  const updateServer = useTrackerSession((state) => state.updateServer)
  const initialized = useTrackerSession((state) => !!state.server);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const devicesActions = useDeviceStoreState();
  const devicesActionsRef = useRef(devicesActions);
  const sessionActions = useTrackerSession();
  const sessionActionsRef = useRef(sessionActions);
  const devicesCount = useDeviceStore((state) => state.count);
  const posCount = useTrackerSession((state) => state.posCount);

  const loadPositions = async (withDevices: boolean) => {
    try {
      const tracker = data?.features?.tracker;

      if (!tracker) {
        return;
      }
      let { domain, token } = tracker;
      if (withDevices) {
        const devicesResponse = await fetch(`${domain}/api/devices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (devicesResponse.ok) {
          devicesActionsRef.current.refresh(await devicesResponse.json());
          
        }
        if (devicesResponse.status === 401) {
          //navigate("/");
        }
      }
      const positionsResponse = await fetch(`${domain}/api/positions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (positionsResponse.ok) {
        sessionActions.updatePositions(await positionsResponse.json());
      }
      if (positionsResponse.status === 401) {
        //navigate("/");
      }
    } catch {
      // ignore errors
    }
  };

  useEffect(()=> {
    if(!data?.user){
      sessionActionsRef.current.reset();
      devicesActionsRef.current.refresh([]);
    }
    setError(null);
    setReady(!!data?.user);
  }, [data?.user])

  useAsyncEffect(async () => {
    const tracker = data?.features?.tracker
    if (!error && tracker && ready) {
      try {
        const response = await fetch(`${tracker.domain}/api/server`);
        if (response.ok) {
          updateServer(await response.json());
          loadPositions(true);
        } else {
          const message = await response.text();
          throw Error(message || response.statusText);
        }
      } catch (error) {
        setError((error as any).message);
      }
    }
  }, [error, ready]);

  if (error) {
    return (
      <Alert
        color="error"
        action={
          <IconButton color="inherit" size="sm" onClick={() => setError(null)}>
            <ReplayIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }
  if (!initialized) {
    return <Loader />;
  }
  return <>
    {devicesCount >= posCount && children}
    <SocketController/>
  </>;
};

export default ServerProvider;
