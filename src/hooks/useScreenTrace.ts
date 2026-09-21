import { useCallback } from 'react';
import { AppState, Platform } from 'react-native';

import { useFocusEffect } from 'expo-router';
import {
  getPerformance,
  trace,
  FirebasePerformanceTypes,
} from '@react-native-firebase/perf';

/**
 * Records one custom Firebase Performance trace sample per visibility session
 * of a screen: the trace starts when the screen becomes visible and stops when
 * it leaves visibility or the app backgrounds. A new sample starts if the app
 * returns to active while the screen is still visible.
 *
 * Uses the cross-platform custom trace API because `startScreenTrace` is
 * Android-only (rejects on iOS).
 */
export function useScreenTrace(screenName: string) {
  useFocusEffect(
    useCallback(() => {
      let screenTrace: FirebasePerformanceTypes.Trace | null = null;

      function startTrace() {
        if (screenTrace) {
          return;
        }

        const newTrace = trace(getPerformance(), screenName);
        newTrace.start();
        newTrace.putAttribute('platform', Platform.OS);
        screenTrace = newTrace;
      }

      function stopTrace() {
        if (!screenTrace) {
          return;
        }

        screenTrace.stop();
        screenTrace = null;
      }

      if (AppState.currentState === 'active') {
        startTrace();
      }

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          startTrace();
        } else {
          stopTrace();
        }
      });

      return () => {
        subscription.remove();
        stopTrace();
      };
    }, [screenName])
  );
}
