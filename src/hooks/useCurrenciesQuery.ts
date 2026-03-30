import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { CurrencyProps } from '@interfaces/currencies';

const fetchCurrencies = async (): Promise<CurrencyProps[]> => {
  const { data } = await api.get('currency');
  return data;
};

export function useCurrenciesQuery() {
  return useQuery<CurrencyProps[]>({
    queryKey: ['currencies'],
    queryFn: fetchCurrencies,
  });
}
