import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTrackerSession } from '../store/session';
import { useAsyncEffect } from '~/hooks/use-async-effect';

export const nativeEnvironment = window.appInterface || (window.webkit && window.webkit.messageHandlers.appInterface);

export const nativePostMessage = (message:any) => {
  if (window.webkit && window.webkit.messageHandlers.appInterface) {
    window.webkit.messageHandlers.appInterface.postMessage(message);
  }
  if (window.appInterface) {
    window.appInterface.postMessage(message);
  }
};

export const generateLoginToken = async () => {
  if (nativeEnvironment) {
    let token = '';
    try {
      const expiration = dayjs().add(6, 'months').toISOString();
      const response = await fetch('/api/session/token', {
        method: 'POST',
        body: new URLSearchParams(`expiration=${expiration}`),
      });
      if (response.ok) {
        token = await response.text();
      }
    } catch (error) {
      token = '';
    }
    nativePostMessage(`login|${token}`);
  }
};

export const handleLoginTokenListeners = new Set<(token:string) => void>();
window.handleLoginToken = (token) => {
  handleLoginTokenListeners.forEach((listener) => listener(token));
};

const updateNotificationTokenListeners = new Set<(token:string) => void>();
window.updateNotificationToken = (token) => {
  updateNotificationTokenListeners.forEach((listener) => listener(token));
};

const NativeInterface = () => {

  const user = useTrackerSession((state) => state.user);
  const updateUser = useTrackerSession((state) => state.updateUser);

  const [notificationToken, setNotificationToken] = useState<string|null>(null);

  useEffect(() => {
    const listener = (token:string) => setNotificationToken(token);
    updateNotificationTokenListeners.add(listener);
    return () => {
      updateNotificationTokenListeners.delete(listener);
    }
  }, [setNotificationToken]);

  useAsyncEffect(async () => {
    if (user && notificationToken) {
      window.localStorage.setItem('notificationToken', notificationToken);
      setNotificationToken(null);

      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (!tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens: [...tokens.slice(-2), notificationToken].join(','),
          },
        };

        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          updateUser(await response.json());
        } else {
          throw Error(await response.text());
        }
      }
    }
  }, [user, notificationToken, setNotificationToken]);

  return null;
};

export default NativeInterface;
