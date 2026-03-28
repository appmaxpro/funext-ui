

import React from 'react';
import { Snackbar, IconButton } from '@funext/ui';
//import { useRegisterSW } from 'virtual:pwa-register/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useTrackerSession } from './tracker/store/session';
import { useTranslation } from './components/app/localization-provider';
import { Icons } from './components';
import { i18n } from './utils';

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
console.log("UpdateController: done")
  return (
    <Snackbar
      open={needRefresh}
      message={i18n.t('settingsUpdateAvailable')}
      action={(
        <IconButton color="inherit" onClick={() => updateServiceWorker(true)}>
          <Icons.Refresh />
        </IconButton>
      )}
    />
  );
};

export default UpdateController;
