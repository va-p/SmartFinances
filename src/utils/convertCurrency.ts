import { useQuotes } from 'src/storage/quotesStorage';

import { CurrencyConversionRates } from '@interfaces/CurrencyConversionRates';

export function ConvertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const brlQuoteBtc = useQuotes((state) => state.brlQuoteBtc);
  const brlQuoteEur = useQuotes((state) => state.brlQuoteEur);
  const brlQuoteUsd = useQuotes((state) => state.brlQuoteUsd);

  const btcQuoteBrl = useQuotes((state) => state.btcQuoteBrl);
  const btcQuoteEur = useQuotes((state) => state.btcQuoteEur);
  const btcQuoteUsd = useQuotes((state) => state.btcQuoteUsd);

  const eurQuoteBrl = useQuotes((state) => state.eurQuoteBrl);
  const eurQuoteBtc = useQuotes((state) => state.eurQuoteBtc);
  const eurQuoteUsd = useQuotes((state) => state.eurQuoteUsd);

  const usdQuoteBrl = useQuotes((state) => state.usdQuoteBrl);
  const usdQuoteEur = useQuotes((state) => state.usdQuoteEur);
  const usdQuoteBtc = useQuotes((state) => state.usdQuoteBtc);

  const currencyConversionRates: CurrencyConversionRates = {
    BRL: {
      BTC: (amount: number) => amount * brlQuoteBtc.price,
      EUR: (amount: number) => amount * brlQuoteEur.price,
      USD: (amount: number) => amount * brlQuoteUsd.price,
    },
    BTC: {
      BRL: (amount: number) => amount * btcQuoteBrl.price,
      EUR: (amount: number) => amount * btcQuoteEur.price,
      USD: (amount: number) => amount * btcQuoteUsd.price,
    },
    EUR: {
      BRL: (amount: number) => amount * eurQuoteBrl.price,
      BTC: (amount: number) => amount * eurQuoteBtc.price,
      USD: (amount: number) => amount * eurQuoteUsd.price,
    },
    USD: {
      BRL: (amount: number) => amount * usdQuoteBrl.price,
      EUR: (amount: number) => amount * usdQuoteEur.price,
      BTC: (amount: number) => amount * usdQuoteBtc.price,
    },
  };

  if (fromCurrency === toCurrency) {
    return amount; // Não precisa converter se as moedas forem iguais
  }
  const conversionFunction = currencyConversionRates[fromCurrency][toCurrency];
  if (!conversionFunction) {
    throw new Error(
      `Conversão de ${fromCurrency} para ${toCurrency} não suportada.`
    );
  }
  return conversionFunction(amount);
}
