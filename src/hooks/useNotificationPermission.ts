import { useEffect, useRef } from 'react';
import { OneSignal } from 'react-native-onesignal';

import { useUserConfigs } from '@stores/userConfigsStorage';
import { storageConfig, DATABASE_CONFIGS } from '@database/database';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

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

        // OneSignal v5 on Android requires explicit initialization.
        // iOS auto-initializes from native config, but calling initialize()
        // on both platforms is safe (idempotent).
        if (ONESIGNAL_APP_ID) {
          OneSignal.initialize(ONESIGNAL_APP_ID);
        } else {
          console.warn(
            '[useNotificationPermission] EXPO_PUBLIC_ONESIGNAL_APP_ID is not set — OneSignal may not be initialized on Android'
          );
        }

        console.log(
          '[useNotificationPermission] Requesting notification permission...'
        );
        const granted =
          await OneSignal.Notifications.requestPermission(true);

        console.log(
          '[useNotificationPermission] Permission result:',
          granted
        );

        // requestPermission() returns the authoritative OS decision.
        // Do NOT use the deprecated hasPermission() — it returns stale
        // data immediately after a fresh grant on iOS.
        if (!granted) {
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
