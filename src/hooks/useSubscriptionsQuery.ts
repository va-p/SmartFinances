import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { SubscriptionProps } from '@interfaces/subscriptions';

async function getSubscriptions(): Promise<SubscriptionProps[]> {
  const { data } = await api.get('subscription');
  return data;
}

export function useSubscriptionsQuery() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });
}
