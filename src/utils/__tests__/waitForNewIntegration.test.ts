import { waitForNewIntegration } from '../waitForNewIntegration';

import { BankingIntegration } from '../../interfaces/bankingIntegration';

const makeIntegration = (id: number): BankingIntegration =>
  ({
    id,
    bankName: 'Banco Teste',
  }) as BankingIntegration;

describe('waitForNewIntegration', () => {
  // CNX-04 — resolves with the fresh list as soon as a new id appears
  it('resolves when a new integration appears', async () => {
    const fresh = [makeIntegration(28)];
    const fetch = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(fresh);

    const result = await waitForNewIntegration(fetch, new Set(), {
      attempts: 4,
      intervalMs: 1,
    });

    expect(result).toEqual(fresh);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // CNX-04 — bounded: null after the budget, never hangs
  it('returns null when nothing new appears within the budget', async () => {
    const fetch = jest.fn().mockResolvedValue([]);

    const result = await waitForNewIntegration(fetch, new Set(), {
      attempts: 3,
      intervalMs: 1,
    });

    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  // CNX-04 — transient fetch failures consume an attempt, never throw
  it('tolerates transient fetch failures', async () => {
    const fresh = [makeIntegration(28)];
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(fresh);

    const result = await waitForNewIntegration(fetch, new Set(), {
      attempts: 4,
      intervalMs: 1,
    });

    expect(result).toEqual(fresh);
  });

  // Only unknown ids count: an unchanged list is not "new"
  it('ignores lists containing only known ids', async () => {
    const fetch = jest.fn().mockResolvedValue([makeIntegration(7)]);

    const result = await waitForNewIntegration(fetch, new Set([7]), {
      attempts: 2,
      intervalMs: 1,
    });

    expect(result).toBeNull();
  });
});
