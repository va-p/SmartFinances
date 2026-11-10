import { requireOptionalNativeModule } from 'expo-modules-core';

import type { WidgetBridgeApi } from './api';

export type { WidgetBridgeApi } from './api';

const NativeWidgetBridge =
  requireOptionalNativeModule<WidgetBridgeApi>('WidgetBridge');

// Null when the native module is absent (e.g. Expo Go): the app works, and
// widgets keep stale data until a development or production build provides
// the module. The startup wiring (T7) registers this with the sync hook.
export { NativeWidgetBridge as WidgetBridge };
