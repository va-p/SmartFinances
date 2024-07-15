export interface Quote {
  price: number;
  last_updated: string;
}

export interface CurrencyConversionRates {
  [fromCurrency: string]: {
    [toCurrency: string]: (amount: number) => number;
  };
}
