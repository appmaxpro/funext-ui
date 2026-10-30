import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTrackerSession } from '../store/session';
import { useAsyncEffect } from '~/hooks/use-async-effect';

export const nativeEnvironment =
  window.appInterface || (window.webkit && window.webkit.messageHandlers.appInterface);

export const nativePostMessage = (message:any) => {
  if (window.webkit && window.webkit.messageHandlers.appInterface) {
    window.webkit.messageHandlers.appInterface.postMessage(message);
  } else if (window.appInterface) {
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
    } catch {
      token = '';
    }
    nativePostMessage(`login|${token}`);
  }
};

export const handleLoginTokenListeners = new Set<(token: string)=> void>();
window.handleLoginToken = (token) => {
  handleLoginTokenListeners.forEach((listener) => listener(token));
};

const updateNotificationTokenListeners = new Set<(token: string)=> void>();
window.updateNotificationToken = (token) => {
  updateNotificationTokenListeners.forEach((listener) => listener(token));
};

export const handleNativeNotificationListeners = new Set< (message:any) => void>();
(window as any).handleNativeNotification = (message:any) => {
  handleNativeNotificationListeners.forEach((listener) => listener(message));
};

const NativeInterface = () => {
  const sessionActions = useTrackerSession();

  const user = useTrackerSession((state) => state.user);
  const [notificationToken, setNotificationToken] = useState(null);

  useEffect(() => {
    updateNotificationTokenListeners.add(setNotificationToken as any);
    return () => {
      updateNotificationTokenListeners.delete(setNotificationToken as any);
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
        if (!response.ok) {
          throw new Error(await response.text());
        }
        sessionActions.updateUser(await response.json());
      }
    }
  }, [user, notificationToken, setNotificationToken]);

  return null;
};

export default NativeInterface;
