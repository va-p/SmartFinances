export interface CurrencyProps {
  id: string;
  name: string;
  code: CurrencyCodes;
  symbol: string;
}

export type CurrencyCodes = 'BTC' | 'BRL' | 'EUR' | 'USD';
