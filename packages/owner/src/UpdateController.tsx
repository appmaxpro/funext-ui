

import React from 'react';
import { Snackbar, IconButton } from '@funext/ui';
import RefreshIcon from '@funext/icons/Refresh';
//import { useRegisterSW } from 'virtual:pwa-register/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useTrackerSession } from './tracker/store/session';
import { useTranslation } from './components/app/localization-provider';

// Based on https://vite-pwa-org.netlify.app/frameworks/react.html
const UpdateController = () => {
  const t = useTranslation();
  const swUpdateInterval = useTrackerSession((state) => state.server.attributes.serviceWorkerUpdateInterval || 3600000);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl:string, swRegistration:any) {
      if (swUpdateInterval > 0 && swRegistration) {
        setInterval(async () => {
          if (!(!swRegistration.installing && navigator)) {
            return;
          }

          if (('connection' in navigator) && !navigator.onLine) {
            return;
          }

          const newSW = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
              cache: 'no-store',
              'cache-control': 'no-cache',
            },
          });

          if (newSW?.status === 200) {
            await swRegistration.update();
          }
        }, swUpdateInterval);
      }
    },
  });

  return (
    <Snackbar
      open={needRefresh}
      message={t('settingsUpdateAvailable')}
      action={(
        <IconButton color="inherit" onClick={() => updateServiceWorker(true)}>
          <RefreshIcon />
        </IconButton>
      )}
    />
  );
};

export default UpdateController;
