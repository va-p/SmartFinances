import apiQuotes from '@api/apiQuotes';

import { Quote } from '@interfaces/CurrencyConversionRates';

async function fetchQuote(
  baseCurrency: string,
  targetCurrency: string
): Promise<Quote> {
  try {
    const { data } = await apiQuotes.get('v2/tools/price-conversion', {
      params: {
        amount: 1,
        symbol: baseCurrency,
        convert: targetCurrency,
      },
    });

    return {
      price:
        targetCurrency === 'BTC'
          ? data.data[0].quote[targetCurrency].price
          : data.data[0].quote[targetCurrency].price.toFixed(2),
      last_updated: data.data[0].quote[targetCurrency].last_updated,
    };
  } catch (error) {
    console.error(
      `Erro ao buscar cotação ${baseCurrency}->${targetCurrency}:`,
      error
    );
    throw error;
  }
}

export default fetchQuote;
