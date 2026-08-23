import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { SubscriptionPaymentProps } from '@interfaces/subscriptions';

async function getSubscriptionPayments(
  month: string,
): Promise<SubscriptionPaymentProps[]> {
  const { data } = await api.get('subscription/payments', {
    params: { month },
  });
  return data;
}

export function useSubscriptionPaymentsQuery(month: string) {
  return useQuery({
    queryKey: ['subscription-payments', month],
    queryFn: () => getSubscriptionPayments(month),
    enabled: !!month,
  });
}
