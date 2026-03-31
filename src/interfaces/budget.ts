import { AccountProps } from './accounts';
import { CurrencyProps } from './currencies';
import { CategoryProps } from './categories';
import { TransactionProps } from './transactions';

export interface BudgetProps {
  id: string;
  name: string;
  amount: number | string;
  amount_spent: number | string;
  percentage: number;
  currency: CurrencyProps;
  account: AccountProps;
  categories: CategoryProps[];
  start_date: string;
  end_date?: string;
  recurrence: string;
  user_id: string;
  transactions: TransactionProps[];
}

export interface FormattedBudgetProps extends BudgetProps {
  amount_spent: number;
  percentage: number;
  current_start_date: Date;
  current_end_date: Date;
  formatted_start_date: string;
  formatted_end_date: string;
  budget_transactions: TransactionProps[];
}
