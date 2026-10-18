import { convertCurrency } from '@utils/convertCurrency';

/**
 * Pure payload builders for the backend transaction contract
 * (.specs/features/transfer-transactions/spec.md TR-6).
 *
 * Transfers (D-02): direction is fixed by the account selectors — the origin
 * account always receives a TRANSFER_DEBIT leg and the destination account a
 * TRANSFER_CREDIT leg. Both legs store positive amounts; the entered amount is
 * normalized to its absolute value.
 *
 * Currency (D-01): `amount` keeps the value in the selected currency and
 * `amount_in_account_currency` stores the value converted into each leg's
 * account currency (null when equal). `exchange_rate` stores the rate that
 * produced each leg's converted value (null when equal): the quote price, or
 * the user-modified rate when exactly one leg converts (D-02).
 */

export type Quote = { price: number };

export type Quotes = {
  brlQuoteBtc: Quote;
  brlQuoteEur: Quote;
  brlQuoteUsd: Quote;
  btcQuoteBrl: Quote;
  btcQuoteEur: Quote;
  btcQuoteUsd: Quote;
  eurQuoteBrl: Quote;
  eurQuoteBtc: Quote;
  eurQuoteUsd: Quote;
  usdQuoteBrl: Quote;
  usdQuoteBtc: Quote;
  usdQuoteEur: Quote;
};

type SelectedCurrency = { id: number; code: string };

type AccountRef = { id: number | null; currency: { code: string } };

type TransferBaseInput = {
  description: string;
  amount: number; // as typed (signed)
  selectedCurrency: SelectedCurrency;
  originAccount: AccountRef;
  destinationAccount: AccountRef;
  categoryId: string;
  tags: unknown[];
  date: Date;
  imageUrl: string | null;
  isRecurring: boolean;
  recurrenceInterval: number | null;
  recurrencePeriod: string | null;
  quotes: Quotes;
  /**
   * User-modified rate for the single converting leg (D-01/D-02). Applies only
   * when exactly one leg converts; ignored otherwise (each leg then uses its
   * own quote). Null/undefined = use the quote.
   */
  exchangeRate?: number | null;
};

/**
 * Converts `amount` from the selected currency into the account currency.
 * Returns `null` when both currencies are equal (no conversion stored).
 */
export function convertToAccountCurrency(
  amount: number,
  fromCode: string,
  accountCode: string,
  quotes: Quotes,
): number | null {
  if (fromCode === accountCode) return null;
  return convertCurrency({
    amount,
    fromCurrency: fromCode,
    toCurrency: accountCode,
    // `accountCurrency` equal to `fromCurrency` disables convertCurrency's
    // internal double-conversion step (see @utils/convertCurrency).
    accountCurrency: fromCode,
    quotes,
  });
}

/**
 * FX-08 / D-04: the quote price for a currency pair — 1 unit of `fromCode` =
 * X units of `toCode` — so `amount × rate = amount_in_account_currency` holds
 * by construction. Null when both codes are equal (no conversion stored).
 */
export function getExchangeRate(
  fromCode: string,
  toCode: string,
  quotes: Quotes,
): number | null {
  if (fromCode === toCode) return null;
  const key = `${fromCode.toLowerCase()}Quote${toCode[0]}${toCode
    .slice(1)
    .toLowerCase()}`;
  const quote = (quotes as Record<string, Quote | undefined>)[key];
  return quote ? quote.price : null;
}

/**
 * FX-08 / AC P2-2: converts `amount` with an explicit rate, mirroring
 * @utils/convertCurrency's per-pair rounding exactly (target BRL rounds to 2
 * decimals; BRL→BTC rounds to 8; every other pair is a raw multiply) so a
 * user-modified rate produces the same precision as the quote-driven path.
 */
export function convertWithRate(
  amount: number,
  rate: number,
  fromCode: string,
  toCode: string,
): number {
  const converted = amount * rate;
  if (toCode === 'BRL') return Number(converted.toFixed(2));
  if (fromCode === 'BRL' && toCode === 'BTC') {
    return Number(converted.toFixed(8));
  }
  return converted;
}

export type SingleLegRate = { leg: 'origin' | 'destination'; quote: number };

/**
 * FX-08 / D-01: the single converting leg of a transfer, when exactly one leg
 * converts (the selected currency equals one account currency but not the
 * other). Null when both legs convert at different rates (no single field is
 * meaningful — AC P2-7) or when neither converts.
 */
export function resolveSingleLegRate(
  selectedCode: string,
  originCode: string,
  destinationCode: string,
  quotes: Quotes,
): SingleLegRate | null {
  const originRate = getExchangeRate(selectedCode, originCode, quotes);
  const destinationRate = getExchangeRate(
    selectedCode,
    destinationCode,
    quotes,
  );
  if (originRate !== null && destinationRate === null) {
    return { leg: 'origin', quote: originRate };
  }
  if (originRate === null && destinationRate !== null) {
    return { leg: 'destination', quote: destinationRate };
  }
  return null;
}

type LegRateConversion = {
  amountInAccountCurrency: number | null;
  exchangeRate: number | null;
};

/**
 * FX-11: per-leg conversion for transfer payloads. Each leg converts against
 * its own account currency at its effective rate — the user-modified rate
 * when it targets this leg via the single-converting-leg rule (D-01/D-02),
 * otherwise the pair quote. A null rate means no conversion stored (leg
 * currency equals the selected currency).
 */
const resolveTransferLegRates = (
  magnitude: number,
  selectedCode: string,
  originCode: string,
  destinationCode: string,
  quotes: Quotes,
  exchangeRateOverride?: number | null,
): { origin: LegRateConversion; destination: LegRateConversion } => {
  const single = resolveSingleLegRate(
    selectedCode,
    originCode,
    destinationCode,
    quotes,
  );

  const convertLeg = (
    legCode: string,
    leg: 'origin' | 'destination',
  ): LegRateConversion => {
    const quoteRate = getExchangeRate(selectedCode, legCode, quotes);
    if (quoteRate === null) {
      return { amountInAccountCurrency: null, exchangeRate: null };
    }
    const rate =
      single !== null && single.leg === leg
        ? exchangeRateOverride ?? quoteRate
        : quoteRate;
    return {
      amountInAccountCurrency: convertWithRate(
        magnitude,
        rate,
        selectedCode,
        legCode,
      ),
      exchangeRate: rate,
    };
  };

  return {
    origin: convertLeg(originCode, 'origin'),
    destination: convertLeg(destinationCode, 'destination'),
  };
};

const recurrenceFields = (input: TransferBaseInput) => ({
  is_recurring: input.isRecurring,
  recurrence_interval: input.isRecurring ? input.recurrenceInterval : null,
  recurrence_period: input.isRecurring ? input.recurrencePeriod : null,
});

/**
 * The backend contract expects `tags` as an array of UUID strings
 * (transaction.schema.ts). Legacy screens still build `{ tag_id }` objects —
 * normalize both shapes here.
 */
export function normalizeTags(tags: unknown[]): string[] {
  return tags
    .map((tag: any) => tag?.tag_id ?? tag?.id ?? tag)
    .filter((tag: unknown): tag is string => typeof tag === "string");
}

/**
 * TR-6 create contract: `isTransfer: true` + `debit`/`credit` legs.
 * Origin → TRANSFER_DEBIT, destination → TRANSFER_CREDIT (D-02).
 */
export function buildTransferCreatePayload(input: TransferBaseInput) {
  const magnitude = Math.abs(input.amount);
  const selectedCode = input.selectedCurrency.code;
  const legRates = resolveTransferLegRates(
    magnitude,
    selectedCode,
    input.originAccount.currency.code,
    input.destinationAccount.currency.code,
    input.quotes,
    input.exchangeRate,
  );

  return {
    isTransfer: true,
    created_at: input.date,
    transaction_date: input.date,
    description: input.description,
    tags: normalizeTags(input.tags),
    image_url: input.imageUrl,
    ...recurrenceFields(input),
    debit: {
      description: input.description,
      amount: magnitude,
      amount_in_account_currency: legRates.origin.amountInAccountCurrency,
      exchange_rate: legRates.origin.exchangeRate,
      currency_id: input.selectedCurrency.id,
      account_id: input.originAccount.id,
      category_id: input.categoryId,
    },
    credit: {
      description: input.description,
      amount: magnitude,
      amount_in_account_currency: legRates.destination.amountInAccountCurrency,
      exchange_rate: legRates.destination.exchangeRate,
      currency_id: input.selectedCurrency.id,
      account_id: input.destinationAccount.id,
      category_id: input.categoryId,
    },
  };
}

export type TransferEditInput = TransferBaseInput & {
  transactionId: string;
  primaryType: 'TRANSFER_DEBIT' | 'TRANSFER_CREDIT';
};

/**
 * D-08/AC-6.3: when editing, the destination selector is pre-filled from the
 * related leg's account — but only when the edited transaction is a transfer
 * leg. Pure decision, unit-tested.
 */
export function resolveTransferDestinationAccount<T>(
  transactionType: string | undefined,
  relatedAccount: T | null,
): T | null {
  if (
    transactionType !== 'TRANSFER_CREDIT' &&
    transactionType !== 'TRANSFER_DEBIT'
  ) {
    return null;
  }
  return relatedAccount ?? null;
}

export type TransactionTabSelection = {
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER';
  // RegisterTransaction tab bar index: 0 Crédito, 1 Transferência, 2 Débito.
  tab: number;
};

/**
 * Maps a stored transaction type (backend enum) to the register screen's
 * tab selection when opening an edit. Transfer legs collapse into the single
 * 'TRANSFER' tab so `handleEditTransaction` stays on the transfer path and
 * sends `buildTransferEditPayload`'s counterpart fields — storing the raw
 * leg type made the edit fall into the plain branch and hit the backend 400
 * "related_transaction_account_id is required to update a transfer".
 * Unknown/legacy types fall back to CREDIT, preserving previous behavior.
 */
export function resolveTransactionTab(
  storedType: string | undefined,
): TransactionTabSelection {
  switch (storedType) {
    case 'DEBIT':
      return { type: 'DEBIT', tab: 2 };
    case 'TRANSFER_CREDIT':
    case 'TRANSFER_DEBIT':
      return { type: 'TRANSFER', tab: 1 };
    case 'CREDIT':
    default:
      return { type: 'CREDIT', tab: 0 };
  }
}

/**
 * TR-4/TR-6 edit contract: `updateRelated: true` plus the counterpart fields.
 * The primary leg keeps its stored type; the counterpart is always the
 * opposite and lives in the destination account. Per-leg `exchange_rate`
 * values ride along (FX-11 / AC P2-10).
 */
export function buildTransferEditPayload(input: TransferEditInput) {
  const magnitude = Math.abs(input.amount);
  const selectedCode = input.selectedCurrency.code;
  const legRates = resolveTransferLegRates(
    magnitude,
    selectedCode,
    input.originAccount.currency.code,
    input.destinationAccount.currency.code,
    input.quotes,
    input.exchangeRate,
  );

  return {
    transaction_id: input.transactionId,
    created_at: input.date,
    transaction_date: input.date,
    description: input.description,
    amount: magnitude,
    amount_in_account_currency: legRates.origin.amountInAccountCurrency,
    exchange_rate: legRates.origin.exchangeRate,
    currency_id: input.selectedCurrency.id,
    type: input.primaryType,
    account_id: input.originAccount.id,
    category_id: input.categoryId,
    tags: normalizeTags(input.tags),
    image_url: input.imageUrl,
    ...recurrenceFields(input),
    updateRelated: true,
    related_transaction_account_id: input.destinationAccount.id,
    amount_in_account_currency_related_transaction:
      legRates.destination.amountInAccountCurrency,
    exchange_rate_related_transaction: legRates.destination.exchangeRate,
  };
}
