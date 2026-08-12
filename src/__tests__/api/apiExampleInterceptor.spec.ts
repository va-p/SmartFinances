jest.mock('react-native-mmkv', () => ({
  MMKV: class {
    getString() {
      return null;
    }
    set() {}
    getBoolean() {
      return false;
    }
  },
}));

jest.mock('@utils/deviceFingerprint', () => ({
  __esModule: true,
  default: jest.fn(),
  getDeviceFingerprint: jest.fn(),
}));

import api from '@api/api_example';
import { getDeviceFingerprint } from '@utils/deviceFingerprint';

/**
 * Spec-anchored tests for the interceptor wiring (spec.md AC1.2 / AC1.4):
 * the axios request interceptor must attach X-Device-Fingerprint to every
 * request. api_example.ts is the tracked canonical copy of the (gitignored)
 * api.ts interceptor, so the wiring pattern is pinned by these tests.
 */

const mockedGetDeviceFingerprint = getDeviceFingerprint as jest.Mock;

describe('api request interceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attaches X-Device-Fingerprint to every request (AC1.2)', async () => {
    mockedGetDeviceFingerprint.mockReturnValue('device-xyz');

    const handler = (api.interceptors.request as any).handlers[0];
    const config: any = { headers: {} };

    const result = await handler.fulfilled(config);

    expect(mockedGetDeviceFingerprint).toHaveBeenCalledTimes(1);
    expect(result.headers['X-Device-Fingerprint']).toBe('device-xyz');
    expect(result).toBe(config);
  });

  it('proceeds with the fallback fingerprint when the util returns one (AC1.3)', async () => {
    mockedGetDeviceFingerprint.mockReturnValue('fallback-123abc');

    const handler = (api.interceptors.request as any).handlers[0];
    const config: any = { headers: {} };

    const result = await handler.fulfilled(config);

    expect(result.headers['X-Device-Fingerprint']).toBe('fallback-123abc');
    expect(result).toBe(config);
  });
});
