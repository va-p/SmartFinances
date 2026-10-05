jest.mock('@database/database', () => {
  const set = jest.fn();
  return {
    storageConfig: {
      set,
      getString: jest.fn(),
      getBoolean: jest.fn(),
    },
    storageUser: { set: jest.fn(), getString: jest.fn() },
    storageToken: { set: jest.fn(), getString: jest.fn() },
    DATABASE_USERS: 'user',
    DATABASE_TOKENS: 'token',
    DATABASE_CONFIGS: 'config',
  };
});

import { useUserConfigs } from '@stores/userConfigsStorage';
import { storageConfig, DATABASE_CONFIGS } from '@database/database';

import { DEFAULT_BASE_CURRENCY } from '@utils/baseCurrency';

import { CurrencyProps } from '@interfaces/currencies';

const usd = {
  id: 5,
  name: 'US Dollar',
  code: 'USD',
  symbol: '$',
} as CurrencyProps;

describe('useUserConfigs base currency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserConfigs.setState(() => ({
      baseCurrency: DEFAULT_BASE_CURRENCY,
    }));
  });

  // BC-01 — the store ships the BRL default with no user action
  it('defaults the base currency to Brazilian Real (id 1)', () => {
    expect(useUserConfigs.getState().baseCurrency).toEqual(
      DEFAULT_BASE_CURRENCY
    );
    expect(useUserConfigs.getState().baseCurrency.id).toBe(1);
    expect(useUserConfigs.getState().baseCurrency.code).toBe('BRL');
  });

  // BC-02 — selecting updates the store state...
  it('updates the base currency in the store', () => {
    useUserConfigs.getState().setBaseCurrency(usd);

    expect(useUserConfigs.getState().baseCurrency).toEqual(usd);
  });

  // BC-02 — ...and persists the full currency object as JSON
  it('persists the selected base currency to MMKV as JSON', () => {
    useUserConfigs.getState().setBaseCurrency(usd);

    expect(storageConfig.set).toHaveBeenCalledWith(
      `${DATABASE_CONFIGS}.baseCurrency`,
      JSON.stringify(usd)
    );
  });

  // BC-06 — the same action keeps reselecting idempotent (no drift between entries)
  it('reselecting the active currency rewrites the same payload', () => {
    useUserConfigs.getState().setBaseCurrency(usd);
    useUserConfigs.getState().setBaseCurrency(usd);

    expect(useUserConfigs.getState().baseCurrency).toEqual(usd);
    expect(storageConfig.set).toHaveBeenCalledTimes(2);
    expect(storageConfig.set).toHaveBeenLastCalledWith(
      `${DATABASE_CONFIGS}.baseCurrency`,
      JSON.stringify(usd)
    );
  });
});
