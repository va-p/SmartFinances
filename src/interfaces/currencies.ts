export type CurrencyCodes = 'BTC' | 'BRL' | 'EUR' | 'USD';

export interface CurrencyProps {
  id: number;
  name: string;
  code: CurrencyCodes;
  symbol: string;
}
