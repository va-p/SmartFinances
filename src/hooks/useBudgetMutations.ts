import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { BudgetProps } from '@interfaces/budget';

const QUERY_KEY = ['budgets'];

// --- API functions ---
const createBudgetFn = (newBudget: any) => api.post('budget', newBudget);
const updateBudgetFn = (editedBudget: any) => api.patch(`budget/${editedBudget.id}`, editedBudget);
const deleteBudgetFn = (budgetId: string) => api.delete(`budget/${budgetId}`);

// --- Create budget ---
export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetFn,

    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar o orçamento. Tente novamente.');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Update budget ---
export function useUpdateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudgetFn,

    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar o orçamento. Tente novamente.');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Delete budget ---
export function useDeleteBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetFn,

    onMutate: async (budgetID) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousBudgets =
        queryClient.getQueryData<BudgetProps[]>(QUERY_KEY);
      queryClient.setQueryData<BudgetProps[]>(QUERY_KEY, (old = []) =>
        old.filter((b) => b.id !== budgetID)
      );
      return { previousBudgets };
    },

    onError: (_error, _budgetID, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(QUERY_KEY, context.previousBudgets);
      }
      Alert.alert(
        'Erro',
        'Não foi possível excluir o orçamento. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
