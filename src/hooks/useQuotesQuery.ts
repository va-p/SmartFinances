import { useQuery } from '@tanstack/react-query';

import fetchQuote from '@utils/fetchQuotes';

const getAllQuotes = async () => {
  const results = await Promise.all([
    fetchQuote('BRL', 'BTC'),
    fetchQuote('BRL', 'EUR'),
    fetchQuote('BRL', 'USD'),
    fetchQuote('BTC', 'BRL'),
    fetchQuote('BTC', 'EUR'),
    fetchQuote('BTC', 'USD'),
    fetchQuote('EUR', 'BRL'),
    fetchQuote('EUR', 'BTC'),
    fetchQuote('EUR', 'USD'),
    fetchQuote('USD', 'BRL'),
    fetchQuote('USD', 'BTC'),
    fetchQuote('USD', 'EUR'),
  ]);

  return {
    brlToBtc: results[0],
    brlToEur: results[1],
    brlToUsd: results[2],
    btcToBrl: results[3],
    btcToEur: results[4],
    btcToUsd: results[5],
    eurToBrl: results[6],
    eurToBtc: results[7],
    eurToUsd: results[8],
    usdToBrl: results[9],
    usdToBtc: results[10],
    usdToEur: results[11],
  };
};

export function useQuotesQuery() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: getAllQuotes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: 'always',
  });
}
