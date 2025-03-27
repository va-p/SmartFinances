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

type CreditCardStatus = 'ACTIVE' | 'BLOCKED' | 'CANCELLED';
type CreditCardHolderType = 'MAIN' | 'ADDITIONAL';

export type CreditDataProps = {
  level: string;
  brand: string; // MASTERCARD
  balanceCloseDate: Date; // 2020-07-08
  balanceDueDate: Date; // 2020-07-17
  availableCreditLimit: number; // 51300
  creditLimit: number; // 51800
  isLimitFlexible: boolean; // false
  balanceForeignCurrency: number; // 500
  minimumPayment?: number; // 100
  status?: CreditCardStatus; // ACTIVE,
  holderType?: CreditCardHolderType; // MAIN
};

export interface AccountProps {
  id: string | null;
  name: string;
  currency: CurrencyProps;
  type: AccountTypes;
  subtype?: AccountSubTypes;
  balance: string;
  initialAmount: number | null;
  totalAccountAmount?: string;
  totalAccountAmountConverted?: string;
  hide?: boolean;
  creditData?: CreditDataProps;
}
