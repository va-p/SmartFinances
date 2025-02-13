import { create } from 'zustand';

import { CurrencyProps } from '@interfaces/currencies';
import { AccountSubTypes, AccountTypes } from '@interfaces/accounts';

type CurrentAccountSelected = {
  accountId: string | null;
  setAccountId: (accountId: string | null) => void;
  accountName: string | null;
  setAccountName: (accountName: string | null) => void;
  accountType: AccountTypes | null;
  setAccountType: (accountType: AccountTypes) => void;
  accountSubType: AccountSubTypes | null;
  setAccountSubType: (accountType: AccountTypes) => void;
  accountCurrency: CurrencyProps | null;
  setAccountCurrency: (accountCurrency: CurrencyProps | null) => void;
  accountBalance: number | null;
  setAccountBalance: (accountBalance: number | null) => void;
  accountInitialAmount: number;
  setAccountInitialAmount: (accountInitialAmount: number) => void;
  accountTotalRevenues: string | null;
  setAccountTotalRevenues: (accountTotalRevenues: string | null) => void;
  accountTotalExpenses: string | null;
  setAccountTotalExpenses: (accountTotalExpenses: string | null) => void;
  accountTotalAmount: string | null;
  setAccountTotalAmount: (accountTotalAmount: string | null) => void;
  accountTenantId: string;
  setAccountTenantId: (accountTenantId: string) => void;
};

export const useCurrentAccountSelected = create<CurrentAccountSelected>(
  (set) => ({
    accountId: null,
    setAccountId: (accountId) => set(() => ({ accountId: accountId })),
    accountName: null,
    setAccountName: (accountName) => set(() => ({ accountName: accountName })),
    accountType: null,
    setAccountType: (accountType) => set(() => ({ accountType: accountType })),
    accountSubType: null,
    setAccountSubType: (accountSubType) =>
      set(() => ({ accountType: accountSubType })),
    accountCurrency: null,
    setAccountCurrency: (accountCurrency) =>
      set(() => ({ accountCurrency: accountCurrency })),
    accountBalance: null,
    setAccountBalance: (accountBalance) =>
      set(() => ({ accountBalance: accountBalance })),
    accountInitialAmount: 0,
    setAccountInitialAmount: (accountInitialAmount) =>
      set(() => ({ accountInitialAmount: accountInitialAmount })),
    accountTotalRevenues: null,
    setAccountTotalRevenues: (accountTotalRevenues) =>
      set(() => ({ accountTotalRevenues: accountTotalRevenues })),
    accountTotalExpenses: null,
    setAccountTotalExpenses: (accountTotalExpenses) =>
      set(() => ({ accountTotalExpenses: accountTotalExpenses })),
    accountTotalAmount: 'R$0',
    setAccountTotalAmount: (accountTotalAmount) =>
      set(() => ({ accountTotalAmount: accountTotalAmount })),
    accountTenantId: '',
    setAccountTenantId: (accountTenantId) =>
      set(() => ({ accountTenantId: accountTenantId })),
  })
);
