import { useQuery } from '@tanstack/react-query';

import getAccounts from '@utils/getAccounts';

import { AccountProps } from '@interfaces/accounts';

export function useAccountsQuery(userId: string | undefined) {
  return useQuery<AccountProps[]>({
    queryKey: ['accounts', userId],

    queryFn: () => getAccounts(userId!),

    enabled: !!userId,
  });
}
