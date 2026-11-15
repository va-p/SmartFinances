import { BankingIntegration } from '@interfaces/bankingIntegration';

type FetchIntegrations = () => Promise<BankingIntegration[]>;

type WaitOptions = {
  attempts?: number;
  intervalMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Polls the integration list until an id outside `knownIds` shows up.
 * Used after the Connect view closes without a deep-link return: the
 * backend usually binds the row via webhook while the view was open.
 * Returns the fresh list on success, or null when the attempt budget
 * runs out (transient fetch failures consume an attempt, never throw).
 */
export async function waitForNewIntegration(
  fetchIntegrations: FetchIntegrations,
  knownIds: Set<number>,
  options?: WaitOptions
): Promise<BankingIntegration[] | null> {
  const { attempts = 4, intervalMs = 3000, sleep = defaultSleep } =
    options ?? {};

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) {
      await sleep(intervalMs);
    }

    let fresh: BankingIntegration[];
    try {
      fresh = await fetchIntegrations();
    } catch {
      continue;
    }

    if (fresh.some((item) => !knownIds.has(item.id))) {
      return fresh;
    }
  }

  return null;
}
