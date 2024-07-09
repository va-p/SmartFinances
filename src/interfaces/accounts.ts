import { CurrencyProps } from './currencies';

export interface AccountProps {
  id: string;
  name: string;
  currency: CurrencyProps;
  initialAmount: string | number;
  totalAccountAmount?: string;
  totalAccountAmountConverted?: string;
  tenantId: string | null;
  hide?: boolean;
}
