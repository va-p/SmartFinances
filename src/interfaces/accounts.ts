import { CurrencyProps } from './currencies';

export interface AccountProps {
  id: string;
  name: string;
  currency: CurrencyProps;
  initial_amount: string | number;
  totalAccountAmount?: string;
  totalAccountAmountConverted?: string;
  tenant_id: number | null;
  hide?: boolean;
}
