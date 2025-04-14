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
  id: string;
  created_at: any;
  description: string;
  amount: number;
  amount_formatted: string | number;
  amount_in_account_currency?: number;
  amount_in_account_currency_formatted?: string | undefined;
  currency: CurrencyProps;
  type: TransactionTypeProps;
  account: AccountProps;
  category: CategoryProps;
  tags: [];
  user_id: string;
}

export type CashFLowData = {
  date: Date | string | number;
  totalRevenuesByPeriod: Decimal;
  totalExpensesByPeriod: Decimal;
  cashFlow?: string;
};
