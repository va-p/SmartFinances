import { Alert } from 'react-native';

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

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

const updateSubscriptionFn = (payload: SubscriptionUpdatePayload) => api.patch('transaction/edit', payload);

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

type SyncedSeriesResponse = { id: string };

export type SyncedSubscriptionUpdatePayload = {
  id: string;
  is_subscription?: false;
  hide_from_subscription_list?: boolean;
};

function invalidateSyncedSubscriptionQueries(
  queryClient: QueryClient,
  seriesId: string
) {
  queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
  queryClient.invalidateQueries({ queryKey: ['subscription', seriesId] });
  queryClient.invalidateQueries({ queryKey: ['subscription-payments'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
}

export function useDesignateSyncedSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: number): Promise<SyncedSeriesResponse> => {
      const { data } = await api.post('subscription/synced/designate', {
        transaction_id: transactionId,
      });
      return data;
    },

    onSuccess: (series) => {
      invalidateSyncedSubscriptionQueries(queryClient, series.id);
    },
  });
}

export function useUpdateSyncedSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...state }: SyncedSubscriptionUpdatePayload) => {
      const { data } = await api.patch(`subscription/synced/${id}`, state);
      return data as { success: boolean };
    },

    onSuccess: (_, payload) => {
      invalidateSyncedSubscriptionQueries(queryClient, payload.id);
    },
  });
}
