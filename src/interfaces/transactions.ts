import Decimal from 'decimal.js';

import { AccountProps } from './accounts';
import { CategoryProps } from './categories';
import { CurrencyProps } from './currencies';

export type TransactionTypeProps =
  | 'CREDIT'
  | 'DEBIT'
  | 'TRANSFER_CREDIT'
  | 'TRANSFER_DEBIT'
  | 'transferCredit'
  | 'transferDebit';

export interface TransactionProps {
  id: number;
  created_at: any;
  /** Real (bank/actual) date; absent on old payloads — fall back to created_at. */
  transaction_date?: any;
  description: string;
  amount: number;
  amount_formatted: string | number;
  amount_in_account_currency?: number;
  amount_in_account_currency_formatted?: string | undefined;
  exchange_rate?: number | null;
  currency: CurrencyProps;
  type: TransactionTypeProps;
  account: AccountProps;
  category: CategoryProps;
  tags: [];
  user_id: string;
  /** Link id for paired transfers; null when unlinked (single-leg). Added for transfer-correction TRC-19; the list DTO now carries it. */
  related_transaction_id?: number | null;
  image_url?: string | null;
  is_recurring?: boolean;
  recurrence_interval?: number | null;
  recurrence_period?: string | null;
  /** Backend subscription classification flags (snake_case DTO). */
  is_subscription?: boolean;
  hide_from_subscription_list?: boolean;
}

export type CashFLowData = {
  date: Date | string | number;
  totalRevenuesByPeriod: Decimal;
  totalExpensesByPeriod: Decimal;
  cashFlow?: string;
};

export type CashFlowChartData = {
  value: number;
  label?: string;
  spacing?: number;
  frontColor: string;
};
