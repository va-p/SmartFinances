import { create } from 'zustand';

import { AccountProps } from '@interfaces/accounts';

type SelectedAccountsFilter = {
  selectedAccountsFilter: AccountProps[];
  setSelectedAccountsFilter: (accounts: AccountProps[]) => void;
};

/**
 * Accounts selected in the Home accounts filter. Empty selection means no
 * filter (all accounts). Session-only by design, matching the adjacent
 * period selector store.
 */
export const useSelectedAccountsFilter = create<SelectedAccountsFilter>(
  (set) => ({
    selectedAccountsFilter: [],
    setSelectedAccountsFilter: (accounts: AccountProps[]) =>
      set(() => ({ selectedAccountsFilter: accounts })),
  })
);
