import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { BudgetProps } from '@interfaces/budget';

const QUERY_KEY = ['budgets'];

const createBudgetFn = async (newBudget: any) => {
  return await api.post('budget', newBudget);
};
const updateBudgetFn = async (editedBudget: any) => {
  return await api.patch('budget/edit', editedBudget);
};
const deleteBudgetFn = async (budgetId: string) => {
  return await api.delete('budget/delete', { params: { budget_id: budgetId } });
};

// --- Create budget ---
export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetFn,

    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousBudgets =
        queryClient.getQueryData<BudgetProps[]>(QUERY_KEY);
      queryClient.setQueryData<BudgetProps[]>(QUERY_KEY, (old = []) => [
        {
          ...newBudget,
          id: `temp-${Date.now()}`,
          amount_spent: 0,
          percentage: 0,
        }, // Payload otimista
        ...old,
      ]);
      return { previousBudgets };
    },

    onError: (error, newBudget, context) => {
      if (context?.previousBudgets)
        queryClient.setQueryData(QUERY_KEY, context.previousBudgets);
      Alert.alert('Erro', 'Não foi possível criar o orçamento.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Update budget ---
export function useUpdateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudgetFn,

    onMutate: async (updatedBudget) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousBudgets =
        queryClient.getQueryData<BudgetProps[]>(QUERY_KEY);
      queryClient.setQueryData<BudgetProps[]>(QUERY_KEY, (old = []) =>
        old.map((b) =>
          b.id === updatedBudget.budget_id ? { ...b, ...updatedBudget } : b
        )
      );
      return { previousBudgets };
    },

    onError: (error, updatedBudget, context) => {
      if (context?.previousBudgets)
        queryClient.setQueryData(QUERY_KEY, context.previousBudgets);
      Alert.alert('Erro', 'Não foi possível atualizar o orçamento.');
    },

    onSettled: () => {
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

    onError: (error, budgetID, context) => {
      if (context?.previousBudgets)
        queryClient.setQueryData(QUERY_KEY, context.previousBudgets);
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
