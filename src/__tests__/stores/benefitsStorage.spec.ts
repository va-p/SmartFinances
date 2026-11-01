import api from '@api/api';

import { useBenefits } from '@stores/benefitsStorage';

// Hoisted above the imports by jest — the axios instance is replaced by the
// mock before the store module initializes.
jest.mock('@api/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockedGet = api.get as unknown as jest.Mock;
const mockedPost = api.post as unknown as jest.Mock;

const PRO_PAYLOAD = {
  plan: { tier: 3, code: 'PRO', name: 'Pro' },
  limits: { image_storage_bytes: null, connections: 5 },
  usage: { image_storage_bytes: 12_000_000, connections: 2 },
  premium: true,
  notice: {
    state: 'PENDING',
    message: 'Your plan no longer covers your current usage',
    grace_deadline: null,
  },
  restricted_integration_ids: [7],
};

const resetStore = () =>
  useBenefits.setState(() => ({
    plan: { tier: 1, code: 'STARTER', name: 'Starter' },
    limits: { image_storage_bytes: 52_428_800, connections: 0 },
    usage: { image_storage_bytes: 0, connections: 0 },
    premium: false,
    notice: null,
    restricted_integration_ids: [],
  }));

// BEN-40 — the store mirrors /benefits/me with safe STARTER defaults
describe('useBenefits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('ships the safe STARTER defaults before any fetch', () => {
    const state = useBenefits.getState();

    expect(state.plan.code).toBe('STARTER');
    expect(state.limits).toEqual({ image_storage_bytes: 52_428_800, connections: 0 });
    expect(state.notice).toBeNull();
    expect(state.premium).toBe(false);
  });

  it('populates the state from a successful /benefits/me fetch', async () => {
    mockedGet.mockResolvedValue({ data: PRO_PAYLOAD });

    await useBenefits.getState().fetchBenefits();

    const state = useBenefits.getState();
    expect(mockedGet).toHaveBeenCalledWith('/benefits/me');
    expect(state.plan).toEqual(PRO_PAYLOAD.plan);
    expect(state.limits).toEqual(PRO_PAYLOAD.limits);
    expect(state.usage).toEqual(PRO_PAYLOAD.usage);
    expect(state.premium).toBe(true);
    expect(state.notice).toEqual(PRO_PAYLOAD.notice);
    expect(state.restricted_integration_ids).toEqual([7]);
  });

  it('leaves the safe STARTER defaults when the fetch fails (fail closed)', async () => {
    mockedGet.mockRejectedValue(new Error('network down'));

    await useBenefits.getState().fetchBenefits();

    const state = useBenefits.getState();
    expect(state.plan.code).toBe('STARTER');
    expect(state.limits).toEqual({ image_storage_bytes: 52_428_800, connections: 0 });
    expect(state.usage).toEqual({ image_storage_bytes: 0, connections: 0 });
    expect(state.premium).toBe(false);
    expect(state.notice).toBeNull();
  });

  it('resets to the STARTER defaults when a refresh fails after a loaded state', async () => {
    mockedGet.mockResolvedValueOnce({ data: PRO_PAYLOAD });
    await useBenefits.getState().fetchBenefits();
    expect(useBenefits.getState().plan.code).toBe('PRO');

    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await useBenefits.getState().fetchBenefits();

    expect(useBenefits.getState().plan.code).toBe('STARTER');
    expect(useBenefits.getState().limits.connections).toBe(0);
  });

  it('acknowledge posts to the endpoint and then refetches the payload', async () => {
    mockedGet.mockResolvedValue({ data: PRO_PAYLOAD });
    await useBenefits.getState().fetchBenefits();

    mockedPost.mockResolvedValue({ data: { success: true } });
    mockedGet.mockResolvedValueOnce({
      data: { ...PRO_PAYLOAD, notice: null, premium: false },
    });

    await useBenefits.getState().acknowledgeNotice();

    expect(mockedPost).toHaveBeenCalledWith('/benefits/acknowledge');
    // Refetch ran after the acknowledge POST and cleared the pending notice.
    expect(mockedGet).toHaveBeenCalledTimes(2);
    expect(
      mockedPost.mock.invocationCallOrder[0] < mockedGet.mock.invocationCallOrder[1]
    ).toBe(true);
    expect(useBenefits.getState().notice).toBeNull();
  });
});
