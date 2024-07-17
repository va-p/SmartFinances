import { CurrencyProps } from './currencies';

export interface AccountProps {
  id: string | null;
  name: string;
  currency: CurrencyProps;
  initialAmount: number | null;
  totalAccountAmount?: string;
  totalAccountAmountConverted?: string;
  tenantId: string | null;
  hide?: boolean;
}
