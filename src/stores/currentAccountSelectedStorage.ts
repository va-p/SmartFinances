import { create } from 'zustand';

import {
  AccountSubTypes,
  AccountTypes,
  CreditDataProps,
} from '@interfaces/accounts';
import { CurrencyProps } from '@interfaces/currencies';
import { BankingIntegration } from '@interfaces/bankingIntegration';

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
  accountBalance: string | null;
  setAccountBalance: (accountBalance: string | null) => void;
  accountInitialAmount: number;
  setAccountInitialAmount: (accountInitialAmount: number) => void;
  accountTotalRevenues: string | null;
  setAccountTotalRevenues: (accountTotalRevenues: string | null) => void;
  accountTotalExpenses: string | null;
  setAccountTotalExpenses: (accountTotalExpenses: string | null) => void;
  accountTotalAmount: string | null;
  setAccountTotalAmount: (accountTotalAmount: string | null) => void;
  accountCreditData: CreditDataProps | null;
  setAccountCreditData: (creditData: CreditDataProps) => void;
  accountBankingIntegration?: BankingIntegration | null;
  setAccountBankingIntegration: (
    bankingIntegration: BankingIntegration | null | undefined
  ) => void;
  // Investment group navigation (INV-03): synthetic `group:<hash>` payload.
  // Null in single-account mode; member screens use the real account id.
  accountGroupKey: string | null;
  setAccountGroupKey: (accountGroupKey: string | null) => void;
  accountGroupMemberIds: string[] | null;
  setAccountGroupMemberIds: (accountGroupMemberIds: string[] | null) => void;
  clearAccountGroup: () => void;
};

export const useCurrentAccountSelected = create<CurrentAccountSelected>(
  (set) => ({
    accountId: null,
    setAccountId: (accountId) => set(() => ({ accountId })),
    accountName: null,
    setAccountName: (accountName) => set(() => ({ accountName })),
    accountType: null,
    setAccountType: (accountType) => set(() => ({ accountType })),
    accountSubType: null,
    setAccountSubType: (accountSubType) =>
      set(() => ({ accountType: accountSubType })),
    accountCurrency: null,
    setAccountCurrency: (accountCurrency) =>
      set(() => ({ accountCurrency })),
    accountBalance: null,
    setAccountBalance: (accountBalance) =>
      set(() => ({ accountBalance })),
    accountInitialAmount: 0,
    setAccountInitialAmount: (accountInitialAmount) =>
      set(() => ({ accountInitialAmount })),
    accountTotalRevenues: null,
    setAccountTotalRevenues: (accountTotalRevenues) =>
      set(() => ({ accountTotalRevenues })),
    accountTotalExpenses: null,
    setAccountTotalExpenses: (accountTotalExpenses) =>
      set(() => ({ accountTotalExpenses })),
    accountTotalAmount: 'R$ 0,00',
    setAccountTotalAmount: (accountTotalAmount) =>
      set(() => ({ accountTotalAmount })),
    accountCreditData: null,
    setAccountCreditData: (creditData) =>
      set(() => ({ accountCreditData: creditData })),
    accountBankingIntegration: undefined,
    setAccountBankingIntegration: (bankingIntegration) =>
      set(() => ({ accountBankingIntegration: bankingIntegration })),
    accountGroupKey: null,
    setAccountGroupKey: (accountGroupKey) =>
      set(() => ({ accountGroupKey })),
    accountGroupMemberIds: null,
    setAccountGroupMemberIds: (accountGroupMemberIds) =>
      set(() => ({ accountGroupMemberIds })),
    clearAccountGroup: () =>
      set(() => ({ accountGroupKey: null, accountGroupMemberIds: null })),
  })
);
