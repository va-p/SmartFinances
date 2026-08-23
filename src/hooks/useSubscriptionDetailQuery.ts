import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { SubscriptionProps } from '@interfaces/subscriptions';

async function getSubscriptionDetail(id: string): Promise<SubscriptionProps> {
  const { data } = await api.get(`subscription/${id}`);
  return data;
}

export function useSubscriptionDetailQuery(id: string) {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => getSubscriptionDetail(id),
    enabled: !!id,
  });
}
