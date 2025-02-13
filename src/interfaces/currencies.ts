export type CurrencyCodes = 'BTC' | 'BRL' | 'EUR' | 'USD';

export interface CurrencyProps {
  id: string;
  name: string;
  code: CurrencyCodes;
  symbol: string;
}
