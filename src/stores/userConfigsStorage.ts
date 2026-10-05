import { create } from 'zustand';

import { CurrencyProps } from '@interfaces/currencies';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { DEFAULT_BASE_CURRENCY } from '@utils/baseCurrency';

export type SortingOption =
  | 'name-asc'
  | 'name-desc'
  | 'balance-asc'
  | 'balance-desc';

type UserConfigs = {
  useLocalAuth: boolean;
  setUseLocalAuth: (useLocalAuth: boolean) => void;
  hideAmount: boolean;
  setHideAmount: (hideAmount: boolean) => void;
  insights: boolean;
  setInsights: (insights: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (notificationsEnabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  sortingOption: SortingOption;
  setSortingOption: (sortingOption: SortingOption) => void;
  baseCurrency: CurrencyProps;
  setBaseCurrency: (baseCurrency: CurrencyProps) => void;
};

export const useUserConfigs = create<UserConfigs>((set) => ({
  useLocalAuth: false,
  hideAmount: false,
  insights: true,
  notificationsEnabled: true,
  darkMode: false,
  sortingOption: 'name-asc',
  baseCurrency: DEFAULT_BASE_CURRENCY,
  setUseLocalAuth: (useLocalAuth) =>
    set(() => ({ useLocalAuth })),
  setHideAmount: (hideAmount) => set(() => ({ hideAmount })),
  setInsights: (insights) => set(() => ({ insights })),
  setNotificationsEnabled: (notificationsEnabled) =>
    set(() => ({ notificationsEnabled })),
  setDarkMode: (darkMode) => set(() => ({ darkMode })),
  setSortingOption: (sortingOption) =>
    set(() => ({ sortingOption })),
  // Single write path for every base-currency entry point (welcome flow,
  // options menu): updating the store also persists to MMKV so callers
  // cannot drift.
  setBaseCurrency: (baseCurrency) => {
    set(() => ({ baseCurrency }));
    storageConfig.set(
      `${DATABASE_CONFIGS}.baseCurrency`,
      JSON.stringify(baseCurrency)
    );
  },
}));
