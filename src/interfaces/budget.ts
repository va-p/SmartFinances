import { AccountProps } from '@interfaces/accounts';
import { CurrencyProps } from '@interfaces/currencies';
import { CategoryProps } from '@interfaces/categories';

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
  tenant_id: string;
}
