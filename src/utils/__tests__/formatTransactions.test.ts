import { formatTransactions } from '../formatTransactions';

import { TransactionProps } from '../../interfaces/transactions';

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' } as const;
const usd = { id: 2, name: 'US Dollar', code: 'USD', symbol: '$' } as const;

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
    currency: usd,
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

describe('formatTransactions', () => {
  // AC3 — ISO created_at becomes dd/MM/yyyy
  it('maps created_at to dd/MM/yyyy', () => {
    const [mapped] = formatTransactions([makeTransaction()]);

    expect(mapped.created_at).toBe('18/08/2026');
  });

  // AC3 — amount rendered as pt-BR currency, not the raw number
  it('formats amount_formatted in the transaction currency', () => {
    const [mapped] = formatTransactions([makeTransaction()]);

    expect(typeof mapped.amount_formatted).toBe('string');
    expect(mapped.amount_formatted).toContain('R$');
    expect(mapped.amount_formatted).toContain('50,00');
  });

  it('formats amount_in_account_currency_formatted in the account currency', () => {
    const [mapped] = formatTransactions([
      makeTransaction({ amount_in_account_currency: 100 }),
    ]);

    expect(mapped.amount_in_account_currency_formatted).toContain('US$');
    expect(mapped.amount_in_account_currency_formatted).toContain('100,00');
  });

  it('leaves amount_in_account_currency_formatted undefined when absent', () => {
    const [mapped] = formatTransactions([makeTransaction()]);

    expect(mapped.amount_in_account_currency_formatted).toBeUndefined();
  });

  // R4 — other fields pass through untouched
  it('preserves the remaining transaction fields', () => {
    const original = makeTransaction();
    const [mapped] = formatTransactions([original]);

    expect(mapped.id).toBe(original.id);
    expect(mapped.category).toEqual(original.category);
    expect(mapped.account).toEqual(original.account);
    expect(mapped.amount).toBe(original.amount);
    expect(mapped.tags).toEqual(original.tags);
  });
});
