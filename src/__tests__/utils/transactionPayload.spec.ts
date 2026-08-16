import {
  buildTransferCreatePayload,
  buildTransferEditPayload,
  convertToAccountCurrency,
  normalizeTags,
  resolveTransactionTab,
  resolveTransferDestinationAccount,
  Quotes,
} from '@utils/transactionPayload';

/**
 * Spec-anchored tests for the transfer payload builders
 * (spec.md TR-6, AC-6.1/AC-6.2, D-02).
 */

const quotes: Quotes = {
  brlQuoteBtc: { price: 0.000001 },
  brlQuoteEur: { price: 0.18 },
  brlQuoteUsd: { price: 0.2 },
  btcQuoteBrl: { price: 500000 },
  btcQuoteEur: { price: 90000 },
  btcQuoteUsd: { price: 100000 },
  eurQuoteBrl: { price: 6 },
  eurQuoteBtc: { price: 0.00001 },
  eurQuoteUsd: { price: 0.9 },
  usdQuoteBrl: { price: 5 },
  usdQuoteBtc: { price: 0.00001 },
  usdQuoteEur: { price: 1.1 },
};

const baseInput = <T extends Record<string, any>>(overrides: T = {} as T) => ({
  description: 'Transfer to savings',
  amount: 100,
  selectedCurrency: { id: 2, code: 'USD' },
  originAccount: { id: 10, currency: { code: 'USD' } },
  destinationAccount: { id: 20, currency: { code: 'BRL' } },
  categoryId: 'cat-1',
  tags: [],
  date: new Date('2026-08-12T10:00:00.000Z'),
  imageUrl: null,
  isRecurring: false,
  recurrenceInterval: null,
  recurrencePeriod: null,
  quotes,
  ...overrides,
});

describe('convertToAccountCurrency', () => {
  it('returns null when the currencies are equal (no conversion stored)', () => {
    expect(convertToAccountCurrency(100, 'USD', 'USD', quotes)).toBeNull();
  });

  it('converts the amount into the account currency', () => {
    expect(convertToAccountCurrency(100, 'USD', 'BRL', quotes)).toBe(500);
  });
});

describe('buildTransferCreatePayload (TR-6 / D-02)', () => {
  it('AC-6.1: emits the isTransfer + debit/credit contract with positive legs', () => {
    const payload = buildTransferCreatePayload(baseInput());

    expect(payload.isTransfer).toBe(true);
    expect(payload.created_at).toEqual(baseInput().date);
    expect(payload.transaction_date).toEqual(baseInput().date);
    expect(payload.debit).toBeDefined();
    expect(payload.credit).toBeDefined();
    expect(payload.debit.amount).toBe(100);
    expect(payload.credit.amount).toBe(100);
    expect(payload.debit.currency_id).toBe(2);
    expect(payload.debit.category_id).toBe('cat-1');
    expect(payload.debit.description).toBe('Transfer to savings');
    expect(payload.credit.description).toBe('Transfer to savings');
  });

  it('D-02: origin account receives the debit leg, destination the credit leg', () => {
    const payload = buildTransferCreatePayload(baseInput());

    expect(payload.debit.account_id).toBe(10);
    expect(payload.credit.account_id).toBe(20);
  });

  it('D-02: a negative typed amount is normalized to positive in both legs', () => {
    const payload = buildTransferCreatePayload(baseInput({ amount: -250 }));

    expect(payload.debit.amount).toBe(250);
    expect(payload.credit.amount).toBe(250);
  });

  it('AC-6.2: each leg converts against its own account currency', () => {
    // Selected EUR: origin BRL (rate 6), destination USD (rate 0.9)
    const payload = buildTransferCreatePayload(
      baseInput({
        amount: 100,
        selectedCurrency: { id: 3, code: 'EUR' },
        originAccount: { id: 10, currency: { code: 'BRL' } },
        destinationAccount: { id: 20, currency: { code: 'USD' } },
      })
    );

    // Debit leg: 100 EUR → 600 BRL
    expect(payload.debit.amount_in_account_currency).toBe(600);
    // Credit leg: 100 EUR → 90 USD
    expect(payload.credit.amount_in_account_currency).toBe(90);
    // Original amount preserved for the audit trail
    expect(payload.debit.amount).toBe(100);
    expect(payload.credit.amount).toBe(100);
  });

  it('AC-6.2: null aic when the leg account currency equals the selected currency', () => {
    const payload = buildTransferCreatePayload(
      baseInput({
        selectedCurrency: { id: 2, code: 'USD' },
        originAccount: { id: 10, currency: { code: 'USD' } },
        destinationAccount: { id: 20, currency: { code: 'BRL' } },
      })
    );

    expect(payload.debit.amount_in_account_currency).toBeNull();
    expect(payload.credit.amount_in_account_currency).toBe(500);
  });

  it('normalizes tags to UUID strings', () => {
    const payload = buildTransferCreatePayload(
      baseInput({
        tags: [{ tag_id: 'uuid-a' }, { id: 'uuid-b' }, 'uuid-c'],
      })
    );

    expect(payload.tags).toEqual(['uuid-a', 'uuid-b', 'uuid-c']);
  });
});

describe('buildTransferEditPayload (TR-4 / TR-6)', () => {
  it('keeps the stored primary type and sends updateRelated + counterpart fields', () => {
    const payload = buildTransferEditPayload(
      baseInput({ transactionId: '7', primaryType: 'TRANSFER_DEBIT' })
    );

    expect(payload.transaction_id).toBe('7');
    expect(payload.type).toBe('TRANSFER_DEBIT');
    expect(payload.amount).toBe(100);
    expect(payload.updateRelated).toBe(true);
    expect(payload.related_transaction_account_id).toBe(20);
    expect(payload.account_id).toBe(10);
  });

  it('AC-6.2: counterpart converted value targets the destination account currency', () => {
    const payload = buildTransferEditPayload(
      baseInput({
        transactionId: '7',
        primaryType: 'TRANSFER_DEBIT',
        selectedCurrency: { id: 2, code: 'USD' },
        originAccount: { id: 10, currency: { code: 'USD' } },
        destinationAccount: { id: 20, currency: { code: 'BRL' } },
      })
    );

    expect(payload.amount_in_account_currency).toBeNull(); // origin USD
    expect(payload.amount_in_account_currency_related_transaction).toBe(500);
  });
});

describe('resolveTransferDestinationAccount (AC-6.3)', () => {
  const account = { id: 20, name: 'Savings' };

  it('returns the related account for transfer legs', () => {
    expect(resolveTransferDestinationAccount('TRANSFER_DEBIT', account)).toBe(
      account
    );
    expect(resolveTransferDestinationAccount('TRANSFER_CREDIT', account)).toBe(
      account
    );
  });

  it('returns null for plain types (never pre-fills)', () => {
    expect(resolveTransferDestinationAccount('DEBIT', account)).toBeNull();
    expect(resolveTransferDestinationAccount('CREDIT', account)).toBeNull();
    expect(resolveTransferDestinationAccount(undefined, account)).toBeNull();
  });

  it('returns null when no related account exists', () => {
    expect(resolveTransferDestinationAccount('TRANSFER_DEBIT', null)).toBeNull();
  });
});

describe('resolveTransactionTab (edit init / TR-6)', () => {
  it('maps transfer legs to the single TRANSFER tab', () => {
    expect(resolveTransactionTab('TRANSFER_DEBIT')).toEqual({
      type: 'TRANSFER',
      tab: 1,
    });
    expect(resolveTransactionTab('TRANSFER_CREDIT')).toEqual({
      type: 'TRANSFER',
      tab: 1,
    });
  });

  it('maps plain types to their own tabs', () => {
    expect(resolveTransactionTab('CREDIT')).toEqual({
      type: 'CREDIT',
      tab: 0,
    });
    expect(resolveTransactionTab('DEBIT')).toEqual({
      type: 'DEBIT',
      tab: 2,
    });
  });

  it('falls back to CREDIT for unknown/legacy types', () => {
    expect(resolveTransactionTab('transferCredit')).toEqual({
      type: 'CREDIT',
      tab: 0,
    });
    expect(resolveTransactionTab(undefined)).toEqual({
      type: 'CREDIT',
      tab: 0,
    });
  });
});

describe('normalizeTags', () => {
  it('maps legacy {tag_id} objects, {id} objects, and plain strings to strings', () => {
    expect(
      normalizeTags([{ tag_id: 'a' }, { id: 'b' }, 'c', 42, null] as any)
    ).toEqual(['a', 'b', 'c']);
  });
});
