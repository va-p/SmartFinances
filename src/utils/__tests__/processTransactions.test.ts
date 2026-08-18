import { processTransactions } from '../processTransactions';

import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;

const makeTransaction = (
  overrides: Partial<TransactionProps> = {}
): TransactionProps => ({
  id: 9,
  // Midday UTC keeps the local calendar day stable across timezones.
  created_at: '2026-08-18T12:00:00.000Z',
  description: 'Ração da Girassol',
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

const selectedDate = new Date(2026, 7, 15); // August 2026

describe('processTransactions', () => {
  // AC1 — raw API (ISO 8601) created_at must be grouped, day title dd/MM/yyyy
  it('groups an ISO-timestamp transaction of the selected month with a dd/MM/yyyy day title', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction()],
      'months',
      selectedDate
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('18/08/2026');
    expect(groupedTransactions[0].data).toHaveLength(1);
    expect(groupedTransactions[0].data[0].id).toBe(9);
    expect(groupedTransactions[0].data[0].created_at).toBe('18/08/2026');
  });

  // AC2 — dd/MM/yyyy pre-formatted input keeps working identically
  it('groups a dd/MM/yyyy pre-formatted transaction identically (backward compat)', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '18/08/2026' })],
      'months',
      selectedDate
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('18/08/2026');
    expect(groupedTransactions[0].data).toHaveLength(1);
  });

  // AC1 — period filtering still excludes out-of-period transactions
  it('excludes transactions outside the selected month', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '2026-07-31T12:00:00.000Z' })],
      'months',
      selectedDate
    );

    expect(groupedTransactions).toHaveLength(0);
  });

  // R3 — period "all" accepts ISO timestamps too
  it('includes ISO transactions when the period is "all"', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: '2025-01-05T12:00:00.000Z' })],
      'all',
      selectedDate
    );

    expect(groupedTransactions).toHaveLength(1);
    expect(groupedTransactions[0].title).toBe('05/01/2025');
  });

  it('drops transactions with an unparseable created_at', () => {
    const { groupedTransactions } = processTransactions(
      [makeTransaction({ created_at: 'not-a-date' })],
      'months',
      selectedDate
    );

    expect(groupedTransactions).toHaveLength(0);
  });
});
