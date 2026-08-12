import DeviceInfo from 'react-native-device-info';

let cachedFingerprint: string | null = null;

/**
 * Returns a stable, device-scoped identifier used as the rate-limit bucket key
 * (X-Device-Fingerprint request header).
 *
 * - iOS: persisted Keychain UUID (survives reinstalls unless the Keychain is
 *   reset).
 * - Android: Settings.Secure.ANDROID_ID (stable per device + signing key).
 *
 * The value is memoized in-memory so the synchronous native call happens once
 * per process. If the native call fails, a non-empty session-local fallback is
 * returned so requests still carry a header (and the app never crashes here).
 */
export function getDeviceFingerprint(): string {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    const uniqueId = DeviceInfo.getUniqueIdSync();
    cachedFingerprint = uniqueId || 'unknown-device';
  } catch {
    cachedFingerprint = `fallback-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  return cachedFingerprint;
}

export default getDeviceFingerprint;
