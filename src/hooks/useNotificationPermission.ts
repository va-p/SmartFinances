import { useEffect, useRef } from 'react';
import { OneSignal } from 'react-native-onesignal';

import { useUserConfigs } from '@stores/userConfigsStorage';
import { storageConfig, DATABASE_CONFIGS } from '@database/database';

export function useNotificationPermission() {
  const hasRequested = useRef(false);
  const notificationsEnabled = useUserConfigs((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useUserConfigs(
    (s) => s.setNotificationsEnabled
  );

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    async function requestPermission() {
      try {
        if (!notificationsEnabled) {
          console.log(
            '[useNotificationPermission] Notifications disabled in config, skipping request'
          );
          return;
        }

        console.log(
          '[useNotificationPermission] Requesting notification permission...'
        );
        const granted =
          await OneSignal.Notifications.requestPermission(true);

        const actualPermission = OneSignal.Notifications.permission;

        console.log('[useNotificationPermission] Permission result:', {
          granted,
          actualPermission,
        });

        if (!actualPermission && notificationsEnabled) {
          console.log(
            '[useNotificationPermission] OS denied permission, syncing config to false'
          );
          storageConfig.set(
            `${DATABASE_CONFIGS}.notificationsEnabled`,
            false
          );
          setNotificationsEnabled(false);
        }
      } catch (error) {
        console.error(
          '[useNotificationPermission] Error requesting permission:',
          error
        );
      }
    }

    requestPermission();
  }, []);
}
