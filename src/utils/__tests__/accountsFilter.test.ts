import {
  filterTransactionsByAccounts,
  getAccountsFilterLabel,
} from '../accountsFilter';

import { AccountProps } from '../../interfaces/accounts';
import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;

const makeAccount = (id: number, name: string): AccountProps => ({
  id,
  name,
  currency: brl,
  type: 'BANK',
  balance: 0,
  initialAmount: null,
});

const accountNubank = makeAccount(13, 'Nubank CC');
const accountItau = makeAccount(14, 'Itaú PF');
const accountWallet = makeAccount(15, 'Carteira');

const makeTransaction = (
  id: number,
  account?: AccountProps
): TransactionProps => ({
  id,
  // Midday UTC keeps the local calendar day stable across timezones.
  created_at: '2026-08-18T12:00:00.000Z',
  description: 'Ração da Girassol',
  amount: -50,
  amount_formatted: -50,
  currency: brl,
  type: 'DEBIT',
  // Optimistic updates can arrive without nested account data — the filter
  // must tolerate it (spec edge: excluded while a filter is active).
  account: account as AccountProps,
  category: {
    id: '80c01d32-c39c-4c65-aa14-99db01a061d5',
    name: 'Animais de estimação',
    icon: { id: 'icon-1', name: 'paw-print' },
    color: { id: 'color-1', color_code: '#000000' },
  },
  tags: [],
  user_id: 'user-1',
});

// Each test builds its own fixture so a mutant that mutates in place cannot
// pre-mutate a shared module-level array and false-pass a later assertion.
const makeTransactions = (): TransactionProps[] => [
  makeTransaction(1, accountNubank),
  makeTransaction(2, accountNubank),
  makeTransaction(3, accountItau),
  makeTransaction(4, accountWallet),
  makeTransaction(5, undefined),
];

describe('getAccountsFilterLabel', () => {
  // ACCFLT-03 / Story 2 AC1 — default state: no filter, all accounts
  it('WHILE no account is selected THEN the label is "Todas..."', () => {
    expect(getAccountsFilterLabel([])).toBe('Todas...');
  });

  // ACCFLT-03 / Story 2 AC2 — single selection shows the account name
  it('WHEN exactly one account is selected THEN the label is that account name', () => {
    expect(getAccountsFilterLabel([accountItau])).toBe('Itaú PF');
  });

  // ACCFLT-03 / Story 2 AC3 — two or more show the count form "X Contas"
  it('WHEN two or more accounts are selected THEN the label is "X Contas"', () => {
    expect(
      getAccountsFilterLabel([accountNubank, accountItau])
    ).toBe('2 Contas');
    expect(
      getAccountsFilterLabel([accountNubank, accountItau, accountWallet])
    ).toBe('3 Contas');
  });
});

describe('filterTransactionsByAccounts', () => {
  // ACCFLT-04 / Story 3 AC1 + edge — empty selection is the default no-filter
  // state: every transaction passes, including the one without account data
  it('WHILE no account is selected THEN returns all transactions unfiltered', () => {
    const transactions = makeTransactions();

    const filtered = filterTransactionsByAccounts(transactions, []);

    expect(filtered.map((transaction) => transaction.id)).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  // ACCFLT-04 / Story 3 AC2 — single account selection
  it('WHILE one account is selected THEN includes only that account transactions', () => {
    const filtered = filterTransactionsByAccounts(makeTransactions(), [
      accountNubank,
    ]);

    expect(filtered.map((transaction) => transaction.id)).toEqual([1, 2]);
  });

  // ACCFLT-04 / Story 3 AC2 — multiple accounts: union of their transactions
  it('WHILE multiple accounts are selected THEN includes the union of their transactions only', () => {
    const filtered = filterTransactionsByAccounts(makeTransactions(), [
      accountNubank,
      accountItau,
    ]);

    expect(filtered.map((transaction) => transaction.id)).toEqual([1, 2, 3]);
  });

  // ACCFLT-04 / Story 3 AC3 — transaction without account data is excluded
  // while a filter is active
  it('IF a transaction has no account data THEN it is excluded while a filter is active', () => {
    const transactionsWithoutAccount = makeTransactions().filter(
      (transaction) => transaction.id === 5
    );

    expect(
      filterTransactionsByAccounts(transactionsWithoutAccount, [accountNubank])
    ).toEqual([]);
  });
});
