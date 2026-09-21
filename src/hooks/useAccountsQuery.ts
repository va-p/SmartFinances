import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

const fetchAccounts = async (
  includeVirtual: boolean
): Promise<AccountProps[]> => {
  const { data } = await api.get('account', {
    params: includeVirtual ? { include_virtual: true } : undefined,
  });
  return data;
};

/**
 * GOAL-49/50: by default the backend excludes virtual goal reserves. Only
 * net-worth consumers (Accounts screen) pass `includeVirtual: true` — the
 * distinct query key keeps the two variants cached separately, and prefix
 * invalidation on ['accounts'] still refreshes both.
 */
export function useAccountsQuery(includeVirtual = false) {
  return useQuery<AccountProps[]>({
    queryKey: includeVirtual ? ['accounts', 'include-virtual'] : ['accounts'],
    queryFn: () => fetchAccounts(includeVirtual),
  });
}
