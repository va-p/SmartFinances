import { CurrencyProps } from './currencies';

export type AccountTypes =
  | 'Carteira'
  | 'Carteira de Criptomoedas'
  | 'Investimentos'
  | 'Poupança'
  | 'Outro'
  | 'WALLET'
  | 'BANK'
  | 'CREDIT'
  | 'CRYPTOCURRENCY WALLET'
  | 'INVESTMENTS'
  | 'OTHER';

export type AccountSubTypes =
  | 'CHECKING_ACCOUNT'
  | 'SAVINGS_ACCOUNT'
  | 'CREDIT_CARD';

export interface AccountProps {
  id: string | null;
  name: string;
  currency: CurrencyProps;
  type: AccountTypes;
  subtype?: AccountSubTypes;
  balance: number;
  initialAmount: number | null;
  totalAccountAmount?: string;
  totalAccountAmountConverted?: string;
  tenantId: string | null;
  hide?: boolean;
}
