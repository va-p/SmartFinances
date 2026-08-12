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
 * account currency (null when equal).
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
      amount_in_account_currency: convertToAccountCurrency(
        magnitude,
        selectedCode,
        input.originAccount.currency.code,
        input.quotes,
      ),
      currency_id: input.selectedCurrency.id,
      account_id: input.originAccount.id,
      category_id: input.categoryId,
    },
    credit: {
      description: input.description,
      amount: magnitude,
      amount_in_account_currency: convertToAccountCurrency(
        magnitude,
        selectedCode,
        input.destinationAccount.currency.code,
        input.quotes,
      ),
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
 * TR-4/TR-6 edit contract: `updateRelated: true` plus the counterpart fields.
 * The primary leg keeps its stored type; the counterpart is always the
 * opposite and lives in the destination account.
 */
export function buildTransferEditPayload(input: TransferEditInput) {
  const magnitude = Math.abs(input.amount);
  const selectedCode = input.selectedCurrency.code;

  return {
    transaction_id: input.transactionId,
    created_at: input.date,
    transaction_date: input.date,
    description: input.description,
    amount: magnitude,
    amount_in_account_currency: convertToAccountCurrency(
      magnitude,
      selectedCode,
      input.originAccount.currency.code,
      input.quotes,
    ),
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
      convertToAccountCurrency(
        magnitude,
        selectedCode,
        input.destinationAccount.currency.code,
        input.quotes,
      ),
  };
}
