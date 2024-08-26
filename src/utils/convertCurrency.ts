import { CurrencyConversionRates } from '@interfaces/CurrencyConversionRates';

type Props = {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  quotes: {
    brlQuoteBtc: { price: number };
    btcQuoteBrl: { price: number };
    eurQuoteBrl: { price: number };
    usdQuoteBrl: { price: number };
  };
}

export const convertCurrency = ({
  amount,
  fromCurrency,
  toCurrency,
  quotes,
}: Props): number => {
  const currencyConversionRates: CurrencyConversionRates = {
    BRL: {
      BTC: (amount: number) => amount * quotes.brlQuoteBtc.price,
      // EUR: (amount: number) => amount * brlQuoteEur.price,
      // USD: (amount: number) => amount * brlQuoteUsd.price,
    },
    BTC: {
      BRL: (amount: number) => amount * quotes.btcQuoteBrl.price,
      // EUR: (amount: number) => amount * btcQuoteEur.price,
      // USD: (amount: number) => amount * btcQuoteUsd.price,
    },
    EUR: {
      BRL: (amount: number) => amount * quotes.eurQuoteBrl.price,
      // BTC: (amount: number) => amount * eurQuoteBtc.price,
      // USD: (amount: number) => amount * eurQuoteUsd.price,
    },
    USD: {
      BRL: (amount: number) => amount * quotes.usdQuoteBrl.price,
      // EUR: (amount: number) => amount * usdQuoteEur.price,
      // BTC: (amount: number) => amount * usdQuoteBtc.price,
    },
  };

  if (fromCurrency === toCurrency) {
    return amount; // No need conversion if currencies are the same
  }

  const conversionFunction = currencyConversionRates[fromCurrency]?.[toCurrency];

  if (!conversionFunction) {
    throw new Error(
      `Conversão de ${fromCurrency} para ${toCurrency} não suportada.`
    );
  }

  return conversionFunction(amount);
};