import { renderHook } from '@testing-library/react-native';

import { useTransactionFiltering } from '../useTransactionFiltering';

import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;

const makeTransaction = (
  id: number,
  description: string,
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id,
  created_at: '18/08/2026',
  description,
  amount: -50,
  amount_formatted: -50,
  currency: brl,
  type: 'DEBIT',
  account: {
    id: 13,
    name: 'Nubank CC',
    type: 'BANK',
    currency: brl,
    balance: 0,
    initialAmount: null,
  },
  category: {
    id: '80c01d32-c39c-4c65-aa14-99db01a061d5',
    name: 'Animais de estimação',
    icon: { id: 'icon-1', name: 'paw-print' },
    color: { id: 'color-1', color_code: '#000000' },
  },
  tags: [],
  user_id: 'user-1',
  ...overrides,
});

const transactionsGrouped = [
  {
    title: '18/08/2026',
    total: 'R$ 100,00',
    data: [
      makeTransaction(1, 'Mercado do Bairro'),
      makeTransaction(2, 'Uber'),
    ],
  },
  {
    title: '17/08/2026',
    total: 'R$ 50,00',
    data: [makeTransaction(3, 'Farmácia')],
  },
];

describe('useTransactionFiltering', () => {
  // SRCH-04 / edge — empty query returns every flattened item (headers + rows)
  it('returns all flattened transactions when the query is empty', () => {
    const { result } = renderHook(() =>
      useTransactionFiltering({ searchQuery: '', transactionsGrouped })
    );

    const { filteredTransactions } = result.current;
    expect(filteredTransactions).toHaveLength(5);
    expect(filteredTransactions.filter((item) => item.isHeader)).toHaveLength(2);
    expect(
      filteredTransactions.filter((item) => !item.isHeader).map((item) => item.id)
    ).toEqual([1, 2, 3]);
  });

  // SRCH-04 — only matching descriptions and their section headers remain
  it('keeps only matching transactions with their section headers', () => {
    const { result } = renderHook(() =>
      useTransactionFiltering({
        searchQuery: 'mercado',
        transactionsGrouped,
      })
    );

    const { filteredTransactions } = result.current;
    expect(filteredTransactions).toHaveLength(2);
    expect(filteredTransactions[0].isHeader).toBe(true);
    expect(filteredTransactions[0].headerTitle).toBe('18/08/2026');
    expect(filteredTransactions[0].headerTotal).toBe('R$ 100,00');
    expect(filteredTransactions[1].id).toBe(1);
    expect(filteredTransactions[1].description).toBe('Mercado do Bairro');
  });

  // Edge — a group with no matches must not leave an orphan header
  it('drops groups with no matching transactions entirely', () => {
    const { result } = renderHook(() =>
      useTransactionFiltering({ searchQuery: 'uber', transactionsGrouped })
    );

    const { filteredTransactions } = result.current;
    expect(filteredTransactions).toHaveLength(2);
    expect(filteredTransactions[0].headerTitle).toBe('18/08/2026');
    expect(filteredTransactions[1].id).toBe(2);
  });

  // SRCH-04 — matching is case-insensitive on the description (plain substring,
  // no diacritic folding — Home parity, see spec.md Out of Scope)
  it('matches the description case-insensitively', () => {
    const { result } = renderHook(() =>
      useTransactionFiltering({
        searchQuery: 'uBeR',
        transactionsGrouped,
      })
    );

    const { filteredTransactions } = result.current;
    expect(filteredTransactions).toHaveLength(2);
    expect(filteredTransactions[1].description).toBe('Uber');
  });

  // Edge — no match anywhere returns the empty list (empty state, no headers)
  it('returns an empty array when no transaction matches', () => {
    const { result } = renderHook(() =>
      useTransactionFiltering({ searchQuery: 'zzz', transactionsGrouped })
    );

    expect(result.current.filteredTransactions).toEqual([]);
  });
});
