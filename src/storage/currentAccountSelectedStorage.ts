import { create } from 'zustand';

export type AccountType =
  | 'Cartão de Crédito'
  | 'Carteira'
  | 'Carteira de Criptomoedas'
  | 'Conta Corrente'
  | 'Investimentos'
  | 'Poupança'
  | 'Outro'
  | null;

type AccountCurrency = {
  id: string;
  name: string;
  code: string;
  symbol: string;
};

type CurrentAccountSelected = {
  accountId: string | null;
  setAccountId: (accountId: string | null) => void;
  accountName: string | null;
  setAccountName: (accountName: string | null) => void;
  accountType: AccountType;
  setAccountType: (accountType: AccountType) => void;
  accountCurrency: AccountCurrency | null;
  setAccountCurrency: (accountCurrency: AccountCurrency | null) => void;
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
    accountCurrency: null,
    setAccountCurrency: (accountCurrency) =>
      set(() => ({ accountCurrency: accountCurrency })),
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
