import { AccountProps } from './accounts';
import { CategoryProps } from './categories';
import { CurrencyProps } from './currencies';

export type TransactionTypeProps =
  | 'credit'
  | 'debit'
  | 'transferDebit'
  | 'transferCredit';

export interface TransactionProps {
  id: string;
  created_at: any;
  description: string;
  amount: number;
  amount_formatted: string | number;
  amount_not_converted?: string | number;
  currency: CurrencyProps;
  type: TransactionTypeProps;
  account: AccountProps;
  category: CategoryProps;
  tags: [];
  tenant_id: string;
}
