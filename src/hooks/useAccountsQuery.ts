import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

const fetchAccounts = async (): Promise<AccountProps[]> => {
  const { data } = await api.get('account');
  return data;
};

export function useAccountsQuery() {
  return useQuery<AccountProps[]>({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });
}
