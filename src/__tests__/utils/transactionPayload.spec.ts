import {
  buildTransferCreatePayload,
  buildTransferEditPayload,
  convertToAccountCurrency,
  convertWithRate,
  getExchangeRate,
  normalizeTags,
  resolveSingleLegRate,
  resolveTransactionTab,
  resolveTransferDestinationAccount,
  Quotes,
} from '@utils/transactionPayload';
import { convertCurrency } from '@utils/convertCurrency';

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

describe('getExchangeRate (FX-08)', () => {
  it('AC P2-1: returns null when the codes are equal (no conversion)', () => {
    expect(getExchangeRate('BRL', 'BRL', quotes)).toBeNull();
  });

  it('D-04: returns the quote price for the pair (1 EUR = 6 BRL, 1 BRL = 0.2 USD)', () => {
    expect(getExchangeRate('EUR', 'BRL', quotes)).toBe(6);
    expect(getExchangeRate('BRL', 'USD', quotes)).toBe(0.2);
  });
});

describe('convertWithRate (FX-08 / AC P2-2)', () => {
  it('rounds target-BRL conversions to 2 decimals exactly like convertCurrency', () => {
    expect(convertWithRate(123.456, 5, 'USD', 'BRL')).toBe(617.28);
    expect(convertWithRate(123.456, quotes.usdQuoteBrl.price, 'USD', 'BRL')).toBe(
      convertCurrency({
        amount: 123.456,
        fromCurrency: 'USD',
        toCurrency: 'BRL',
        accountCurrency: 'USD',
        quotes,
      })
    );
  });

  it('rounds BRL→BTC conversions to 8 decimals exactly like convertCurrency', () => {
    expect(convertWithRate(500, quotes.brlQuoteBtc.price, 'BRL', 'BTC')).toBe(0.0005);
    expect(convertWithRate(500, quotes.brlQuoteBtc.price, 'BRL', 'BTC')).toBe(
      convertCurrency({
        amount: 500,
        fromCurrency: 'BRL',
        toCurrency: 'BTC',
        accountCurrency: 'BRL',
        quotes,
      })
    );
  });

  it('rounds BTC→BRL conversions to 2 decimals exactly like convertCurrency', () => {
    expect(convertWithRate(2, quotes.btcQuoteBrl.price, 'BTC', 'BRL')).toBe(1000000);
    expect(convertWithRate(2, quotes.btcQuoteBrl.price, 'BTC', 'BRL')).toBe(
      convertCurrency({
        amount: 2,
        fromCurrency: 'BTC',
        toCurrency: 'BRL',
        accountCurrency: 'BTC',
        quotes,
      })
    );
  });

  it('keeps raw precision for non-BRL targets exactly like convertCurrency', () => {
    expect(convertWithRate(100, quotes.eurQuoteUsd.price, 'EUR', 'USD')).toBe(90);
    expect(convertWithRate(100, quotes.eurQuoteUsd.price, 'EUR', 'USD')).toBe(
      convertCurrency({
        amount: 100,
        fromCurrency: 'EUR',
        toCurrency: 'USD',
        accountCurrency: 'EUR',
        quotes,
      })
    );
  });
});

describe('resolveSingleLegRate (FX-08 / D-01)', () => {
  it('returns the destination leg when only the destination converts', () => {
    // selected BRL, origin BRL, destination USD
    expect(resolveSingleLegRate('BRL', 'BRL', 'USD', quotes)).toEqual({
      leg: 'destination',
      quote: 0.2,
    });
  });

  it('returns the origin leg when only the origin converts', () => {
    // selected USD, origin BRL, destination USD
    expect(resolveSingleLegRate('USD', 'BRL', 'USD', quotes)).toEqual({
      leg: 'origin',
      quote: 5,
    });
  });

  it('AC P2-7: returns null when both legs convert at different rates', () => {
    // selected EUR, origin BRL, destination USD
    expect(resolveSingleLegRate('EUR', 'BRL', 'USD', quotes)).toBeNull();
  });

  it('returns null when neither leg converts', () => {
    expect(resolveSingleLegRate('USD', 'USD', 'USD', quotes)).toBeNull();
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

  it('FX-11: stores a per-leg exchange_rate alongside each converted value', () => {
    // Selected EUR: origin BRL (rate 6), destination USD (rate 0.9)
    const payload = buildTransferCreatePayload(
      baseInput({
        amount: 100,
        selectedCurrency: { id: 3, code: 'EUR' },
        originAccount: { id: 10, currency: { code: 'BRL' } },
        destinationAccount: { id: 20, currency: { code: 'USD' } },
      })
    );

    expect(payload.debit.exchange_rate).toBe(6);
    expect(payload.credit.exchange_rate).toBe(0.9);
  });

  it('FX-11: stores a null rate on the non-converting leg', () => {
    // USD selected, origin USD (no conversion), destination BRL
    const payload = buildTransferCreatePayload(
      baseInput({
        selectedCurrency: { id: 2, code: 'USD' },
        originAccount: { id: 10, currency: { code: 'USD' } },
        destinationAccount: { id: 20, currency: { code: 'BRL' } },
      })
    );

    expect(payload.debit.exchange_rate).toBeNull();
    expect(payload.credit.exchange_rate).toBe(5);
    expect(payload.credit.amount_in_account_currency).toBe(500);
  });

  it('AC P2-6: a modified rate recomputes only the converting leg', () => {
    // USD selected, origin USD (no conversion), destination BRL; user rate 6
    const payload = buildTransferCreatePayload(
      baseInput({
        selectedCurrency: { id: 2, code: 'USD' },
        originAccount: { id: 10, currency: { code: 'USD' } },
        destinationAccount: { id: 20, currency: { code: 'BRL' } },
        exchangeRate: 6,
      })
    );

    expect(payload.debit.amount_in_account_currency).toBeNull();
    expect(payload.debit.exchange_rate).toBeNull();
    // 100 × 6 (user rate), not the 500 quote-driven value
    expect(payload.credit.amount_in_account_currency).toBe(600);
    expect(payload.credit.exchange_rate).toBe(6);
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

  it('AC P2-10: emits per-leg rates including exchange_rate_related_transaction', () => {
    // USD selected, origin USD (no conversion), destination BRL
    const payload = buildTransferEditPayload(
      baseInput({
        transactionId: '7',
        primaryType: 'TRANSFER_DEBIT',
        selectedCurrency: { id: 2, code: 'USD' },
        originAccount: { id: 10, currency: { code: 'USD' } },
        destinationAccount: { id: 20, currency: { code: 'BRL' } },
      })
    );

    expect(payload.exchange_rate).toBeNull(); // origin USD = no conversion
    expect(payload.exchange_rate_related_transaction).toBe(5);
  });

  it('AC P2-6/P2-10: a modified rate recomputes only the converting counterpart leg', () => {
    const payload = buildTransferEditPayload(
      baseInput({
        transactionId: '7',
        primaryType: 'TRANSFER_DEBIT',
        selectedCurrency: { id: 2, code: 'USD' },
        originAccount: { id: 10, currency: { code: 'USD' } },
        destinationAccount: { id: 20, currency: { code: 'BRL' } },
        exchangeRate: 6,
      })
    );

    expect(payload.amount_in_account_currency).toBeNull();
    expect(payload.exchange_rate).toBeNull();
    // 100 × 6 (user rate), not the 500 quote-driven value
    expect(payload.amount_in_account_currency_related_transaction).toBe(600);
    expect(payload.exchange_rate_related_transaction).toBe(6);
  });

  it('AC P2-7: stores quote-derived per-leg rates when both legs convert', () => {
    // Selected EUR: origin BRL (rate 6), destination USD (rate 0.9)
    const payload = buildTransferEditPayload(
      baseInput({
        transactionId: '7',
        primaryType: 'TRANSFER_DEBIT',
        selectedCurrency: { id: 3, code: 'EUR' },
        originAccount: { id: 10, currency: { code: 'BRL' } },
        destinationAccount: { id: 20, currency: { code: 'USD' } },
      })
    );

    expect(payload.amount_in_account_currency).toBe(600);
    expect(payload.exchange_rate).toBe(6);
    expect(payload.amount_in_account_currency_related_transaction).toBe(90);
    expect(payload.exchange_rate_related_transaction).toBe(0.9);
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
