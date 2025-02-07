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
      BTC: (amount: number) => {
        console.log('aeee');
        const result = (amount * quotes.brlQuoteBtc.price).toFixed(8);
        return Number(result);
      },
      EUR: (amount: number) => amount * quotes.brlQuoteEur.price,
      USD: (amount: number) => amount * quotes.brlQuoteUsd.price,
    },
    BTC: {
      BRL: (amount: number) => {
        const result = amount * quotes.btcQuoteBrl.price;
        return Number(result.toFixed(2));
      },
      EUR: (amount: number) => amount * quotes.btcQuoteEur.price,
      USD: (amount: number) => amount * quotes.btcQuoteUsd.price,
    },
    EUR: {
      BRL: (amount: number) => {
        const result = amount * quotes.eurQuoteBrl.price;
        return Number(result.toFixed(2));
      },
      BTC: (amount: number) => amount * quotes.eurQuoteBtc.price,
      USD: (amount: number) => amount * quotes.eurQuoteUsd.price,
    },
    USD: {
      BRL: (amount: number) => {
        const result = amount * quotes.usdQuoteBrl.price;
        return Number(result.toFixed(2));
      },
      EUR: (amount: number) => amount * quotes.usdQuoteEur.price,
      BTC: (amount: number) => amount * quotes.usdQuoteBtc.price,
    },
  };

  console.log('amount ===>', amount);
  console.log('fromCurrency ===>', fromCurrency);
  console.log('toCurrency ===>', toCurrency);
  console.log('accountCurrency ===>', accountCurrency);
  console.log('quotes ===>', quotes);

  // 1. Verificar se a moeda da transação é diferente da moeda da conta de origem
  console.log(
    'fromCurrency !== accountCurrency ?? ===>',
    fromCurrency !== accountCurrency
  );
  if (fromCurrency !== accountCurrency) {
    // Converter para a moeda da conta de origem
    amount = convertCurrency({
      amount,
      fromCurrency,
      toCurrency: accountCurrency,
      accountCurrency: fromCurrency,
      quotes,
    });
  }

  // 2. Verificar se a conversão para a moeda de destino ainda é necessária
  console.log(
    'fromCurrency !== toCurrency ??? ===>',
    fromCurrency !== toCurrency
  );
  if (fromCurrency !== toCurrency) {
    const conversionFunction =
      currencyConversionRates[fromCurrency]?.[toCurrency];

    if (!conversionFunction) {
      throw new Error(
        `Conversão de ${accountCurrency} para ${toCurrency} não suportada.`
      );
    }

    return conversionFunction(amount);
  }

  return amount;
};
