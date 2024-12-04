import { CurrencyProps } from './currencies';

export type AccountTypes =
  | 'Cartão de Crédito'
  | 'Carteira'
  | 'Carteira de Criptomoedas'
  | 'Conta Corrente'
  | 'Investimentos'
  | 'Poupança'
  | 'Outro';

export interface AccountProps {
  id: string | null;
  name: string;
  currency: CurrencyProps;
  type: AccountTypes;
  initialAmount: number | null;
  totalAccountAmount?: string;
  totalAccountAmountConverted?: string;
  tenantId: string | null;
  hide?: boolean;
}
