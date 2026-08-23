import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

/**
 * Updates a subscription by patching its parent transaction
 * (classification, hide flag, or payment details). See spec.md R11/AC11.4.
 */
export type SubscriptionUpdatePayload = {
  transaction_id: number;
  amount?: number;
  transaction_date?: string;
  recurrence_interval?: number;
  recurrence_period?: 'MONTHLY' | 'YEARLY';
  is_subscription?: boolean;
  hide_from_subscription_list?: boolean;
};

const updateSubscriptionFn = async (payload: SubscriptionUpdatePayload) => {
  return await api.patch('transaction/edit', payload);
};

export function useUpdateSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubscriptionFn,

    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({
        queryKey: ['subscription', String(payload.transaction_id)],
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-payments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },

    onError: (error: any) => {
      Alert.alert(
        'Assinatura',
        error?.response?.data?.message ||
          'Não foi possível atualizar a assinatura. Por favor, tente novamente.'
      );
    },
  });
}
