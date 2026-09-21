import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

export type GoalDepositInput = {
  goalId: string;
  amount: number;
  source_account_id: number;
  /** Linked target when the goal has no reserve (GOAL-46/48). */
  linked_account_id?: number;
  amount_in_account_currency?: number | null;
  /** Per-leg conversions for reserve-less transfers (GOAL-16). */
  amount_in_source_currency?: number | null;
  amount_in_target_currency?: number | null;
  category_id?: string;
  description?: string;
  transaction_date?: string;
};

export type GoalWithdrawInput = {
  goalId: string;
  amount: number;
  destination_account_id: number;
  /** Linked source when the goal has no reserve (GOAL-47/48). */
  linked_account_id?: number;
  amount_in_account_currency?: number | null;
  /** Per-leg conversions for reserve-less transfers (GOAL-16). */
  amount_in_source_currency?: number | null;
  amount_in_target_currency?: number | null;
  category_id?: string;
  description?: string;
  transaction_date?: string;
};

// --- API functions ---
const depositToGoalFn = async ({ goalId, ...payload }: GoalDepositInput) => {
  return await api.post(`goal/${goalId}/deposit`, payload);
};
const withdrawFromGoalFn = async ({
  goalId,
  ...payload
}: GoalWithdrawInput) => {
  return await api.post(`goal/${goalId}/withdraw`, payload);
};

// Movements write transfer pairs, so balances and histories everywhere go
// stale (GOAL-18).
const invalidateMovementQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  goalId: string
) => {
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
  queryClient.invalidateQueries({ queryKey: ['accounts'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
};

// --- Deposit into goal ---
export function useGoalDepositMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: depositToGoalFn,

    onError: (_error, _input) => {
      Alert.alert(
        'Erro',
        'Não foi possível depositar na meta. Por favor, tente novamente.'
      );
    },

    onSettled: (_data, _error, { goalId }) => {
      invalidateMovementQueries(queryClient, goalId);
    },
  });
}

// --- Withdraw from goal ---
export function useGoalWithdrawMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawFromGoalFn,

    onError: (_error, _input) => {
      Alert.alert(
        'Erro',
        'Não foi possível sacar da meta. Por favor, tente novamente.'
      );
    },

    onSettled: (_data, _error, { goalId }) => {
      invalidateMovementQueries(queryClient, goalId);
    },
  });
}
