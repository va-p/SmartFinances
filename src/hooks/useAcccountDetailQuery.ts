import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

const fetchAccountDetail = async (accountID: string): Promise<AccountProps> => {
  const { data } = await api.get('account/single', {
    params: {
      account_id: accountID,
    },
  });
  return data;
};

export function useAccountDetailQuery(accountID: string) {
  return useQuery({
    queryKey: ['account', accountID],
    queryFn: () => fetchAccountDetail(accountID),
    enabled: !!accountID,
  });
}
