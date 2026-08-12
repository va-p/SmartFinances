jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: { getUniqueIdSync: jest.fn() },
}));

/**
 * Spec-anchored tests for the device fingerprint used as the rate-limit bucket
 * key (spec.md R1: AC1.1 memoization, AC1.3 fallback).
 *
 * Each test runs inside jest.isolateModules so the module-level memoization
 * cache starts fresh and the jest.mock factory re-runs per isolated registry.
 */

describe('getDeviceFingerprint', () => {
  it('returns the native device id and memoizes it (AC1.1)', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DeviceInfo = require('react-native-device-info').default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getDeviceFingerprint } = require('@utils/deviceFingerprint');

      DeviceInfo.getUniqueIdSync.mockReturnValue('device-abc');

      expect(getDeviceFingerprint()).toBe('device-abc');
      expect(getDeviceFingerprint()).toBe('device-abc');
      expect(DeviceInfo.getUniqueIdSync).toHaveBeenCalledTimes(1);
    });
  });

  it('falls back to a non-empty session-local value when the native call throws (AC1.3)', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DeviceInfo = require('react-native-device-info').default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getDeviceFingerprint } = require('@utils/deviceFingerprint');

      DeviceInfo.getUniqueIdSync.mockImplementation(() => {
        throw new Error('native module failure');
      });

      const fingerprint = getDeviceFingerprint();

      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
      expect(fingerprint).toMatch(/^fallback-/);
      expect(getDeviceFingerprint()).toBe(fingerprint);
      expect(DeviceInfo.getUniqueIdSync).toHaveBeenCalledTimes(1);
    });
  });

  it('falls back when the native call returns an empty string', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DeviceInfo = require('react-native-device-info').default;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getDeviceFingerprint } = require('@utils/deviceFingerprint');

      DeviceInfo.getUniqueIdSync.mockReturnValue('');

      expect(getDeviceFingerprint()).toBe('unknown-device');
    });
  });
});
