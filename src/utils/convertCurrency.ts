import { CurrencyConversionRates } from '@interfaces/CurrencyConversionRates';

type Props = {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  accountCurrency: string;
  quotes: {
    brlQuoteBtc: { price: number };
    brlQuoteEur: { price: number };
    brlQuoteUsd: { price: number };
    btcQuoteBrl: { price: number };
    btcQuoteEur: { price: number };
    btcQuoteUsd: { price: number };
    eurQuoteBrl: { price: number };
    eurQuoteBtc: { price: number };
    eurQuoteUsd: { price: number };
    usdQuoteBrl: { price: number };
    usdQuoteBtc: { price: number };
    usdQuoteEur: { price: number };
  };
};

export const convertCurrency = ({
  amount,
  fromCurrency,
  toCurrency,
  accountCurrency,
  quotes,
}: Props): number => {
  const currencyConversionRates: CurrencyConversionRates = {
    BRL: {
      BTC: (value: number) => {
        const result = (value * quotes.brlQuoteBtc.price).toFixed(8);
        return Number(result);
      },
      EUR: (value: number) => value * quotes.brlQuoteEur.price,
      USD: (value: number) => value * quotes.brlQuoteUsd.price,
    },
    BTC: {
      BRL: (value: number) => {
        const result = value * quotes.btcQuoteBrl.price;
        return Number(result.toFixed(2));
      },
      EUR: (value: number) => value * quotes.btcQuoteEur.price,
      USD: (value: number) => value * quotes.btcQuoteUsd.price,
    },
    EUR: {
      BRL: (value: number) => {
        const result = value * quotes.eurQuoteBrl.price;
        return Number(result.toFixed(2));
      },
      BTC: (value: number) => value * quotes.eurQuoteBtc.price,
      USD: (value: number) => value * quotes.eurQuoteUsd.price,
    },
    USD: {
      BRL: (value: number) => {
        const result = value * quotes.usdQuoteBrl.price;
        return Number(result.toFixed(2));
      },
      EUR: (value: number) => value * quotes.usdQuoteEur.price,
      BTC: (value: number) => value * quotes.usdQuoteBtc.price,
    },
  };

  let convertedAmount = amount;

  // 1. Verificar se a moeda da transação é diferente da moeda da conta de origem
  if (fromCurrency !== accountCurrency) {
    // Converter para a moeda da conta de origem
    convertedAmount = convertCurrency({
      amount: convertedAmount,
      fromCurrency,
      toCurrency: accountCurrency,
      accountCurrency: fromCurrency,
      quotes,
    });
  }

  // 2. Verificar se a conversão para a moeda de destino ainda é necessária
  if (fromCurrency !== toCurrency) {
    const conversionFunction =
      currencyConversionRates[fromCurrency]?.[toCurrency];

    if (!conversionFunction) {
      throw new Error(
        `Conversão de ${accountCurrency} para ${toCurrency} não suportada.`
      );
    }

    return conversionFunction(convertedAmount);
  }

  return convertedAmount;
};
