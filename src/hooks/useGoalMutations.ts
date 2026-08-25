import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { CurrencyProps } from '@interfaces/currencies';
import { GoalProps, GoalStatusAction } from '@interfaces/goals';

const QUERY_KEY = ['goals'];

export type CreateGoalInput = {
  name: string;
  target_amount: number;
  currency_id: number;
  deadline?: string | null;
  linked_account_ids?: number[];
};

export type UpdateGoalInput = {
  goalId: string;
  name?: string;
  target_amount?: number;
  deadline?: string | null;
  linked_account_ids?: number[];
};

export type DeleteGoalInput = {
  goalId: string;
  destinationAccountId?: number;
};

export type GoalStatusInput = {
  goalId: string;
  action: GoalStatusAction;
};

// --- API functions ---
const createGoalFn = async (newGoal: CreateGoalInput) => {
  return await api.post('goal', newGoal);
};
const updateGoalFn = async ({ goalId, ...payload }: UpdateGoalInput) => {
  return await api.patch(`goal/${goalId}`, payload);
};
const deleteGoalFn = async ({
  goalId,
  destinationAccountId,
}: DeleteGoalInput) => {
  return await api.delete(`goal/${goalId}`, {
    data: { destination_account_id: destinationAccountId },
  });
};
const updateGoalStatusFn = async ({ goalId, action }: GoalStatusInput) => {
  return await api.patch(`goal/${goalId}/status`, { action });
};

// --- Create goal ---
export function useCreateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGoalFn,

    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousGoals = queryClient.getQueryData<GoalProps[]>(QUERY_KEY);

      // The payload lacks the server-computed relations, so the temp row
      // mirrors them with neutral values; the real currency comes from the
      // currencies cache when it is warm.
      const currency = queryClient
        .getQueryData<CurrencyProps[]>(['currencies'])
        ?.find((c) => c.id === newGoal.currency_id);

      const optimisticGoal: GoalProps = {
        id: `temp-${Date.now()}`,
        name: newGoal.name,
        target_amount: String(newGoal.target_amount),
        status: 'ACTIVE',
        deadline: newGoal.deadline ?? null,
        completed_at: null,
        currency: currency ?? {
          id: newGoal.currency_id,
          code: 'BRL',
          symbol: '',
        },
        reserve_account: {
          id: 0,
          name: `Reserva: ${newGoal.name}`,
          balance: 0,
          is_virtual: true,
          currency_id: newGoal.currency_id,
        },
        linked_accounts: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<GoalProps[]>(QUERY_KEY, (old = []) => [
        optimisticGoal,
        ...old,
      ]);

      return { previousGoals };
    },

    onError: (_error, _newGoal, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(QUERY_KEY, context.previousGoals);
      }
      Alert.alert('Erro', 'Não foi possível criar a meta. Tente novamente.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Update goal ---
export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGoalFn,

    onError: (_error, _updatedGoal) => {
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a meta. Tente novamente.'
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Delete goal ---
export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGoalFn,

    onMutate: async ({ goalId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousGoals = queryClient.getQueryData<GoalProps[]>(QUERY_KEY);
      queryClient.setQueryData<GoalProps[]>(QUERY_KEY, (old = []) =>
        old.filter((goal) => goal.id !== goalId)
      );
      return { previousGoals };
    },

    onError: (_error, _input, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(QUERY_KEY, context.previousGoals);
      }
      Alert.alert(
        'Erro',
        'Não foi possível excluir a meta. Por favor, tente novamente.'
      );
    },

    onSettled: (_data, _error, { goalId }) => {
      // Delete may transfer the reserve balance back to a real account
      // server-side, so accounts/transactions change too (GOAL-37).
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// --- Goal status (conclude / archive / unarchive) ---
export function useUpdateGoalStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGoalStatusFn,

    onError: (_error, _input) => {
      Alert.alert(
        'Erro',
        'Não foi possível atualizar o status da meta. Tente novamente.'
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
