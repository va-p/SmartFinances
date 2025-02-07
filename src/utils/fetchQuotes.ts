import { Alert } from 'react-native';

import apiQuotes from '@api/apiQuotes';

import { Quote } from '@interfaces/CurrencyConversionRates';

async function fetchQuote(
  baseCurrency: string,
  targetCurrency: string,
  setQuote: (quote: Quote) => void
) {
  try {
    const { data } = await apiQuotes.get('v2/tools/price-conversion', {
      params: {
        amount: 1,
        symbol: baseCurrency,
        convert: targetCurrency,
      },
    });

    console.log(
      'baseCurrency:',
      baseCurrency,
      'targetCurrency:',
      targetCurrency,
      'price:',
      data.data[0].quote[targetCurrency].price
    );
    console.log(
      'price toFixed:',
      data.data[0].quote[targetCurrency].price.toFixed(2)
    );
    setQuote({
      price:
        targetCurrency === 'BTC'
          ? data.data[0].quote[targetCurrency].price
          : data.data[0].quote[targetCurrency].price.toFixed(2),
      last_updated: data.data[0].quote[targetCurrency].last_updated,
    });
  } catch (error) {
    console.error(error);
    Alert.alert(
      'Cotação de moedas',
      'Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.'
    );
  }
}

export default fetchQuote;
