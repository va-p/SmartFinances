import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

const fetchAccounts = async (
  userID: string | null
): Promise<AccountProps[]> => {
  const { data } = await api.get('account', {
    params: {
      user_id: userID,
    },
  });
  return data;
};

export function useAccountsQuery(userID: string | undefined) {
  return useQuery<AccountProps[]>({
    queryKey: ['accounts', userID],
    queryFn: () => fetchAccounts(userID!),
    enabled: !!userID,
  });
}
