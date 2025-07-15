import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

// --- Create transaction ---
async function createTransactionFn(newTransaction: any) {
  const { data } = await api.post(
    'transaction_test_related_transaction',
    newTransaction
  );
  return data;
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransactionFn,

    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueryData(['transactions'], (oldData: any) => {
        if (!oldData) return [newTransaction];
        const optimisticTransaction = {
          ...newTransaction,
          id: `temp-${Date.now()}`,
        };
        return [optimisticTransaction, ...oldData];
      });

      return { previousTransactions };
    },

    onError: (error, _, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ['transactions'],
          context.previousTransactions
        );
      }
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível registrar a transação. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// --- Update transaction ---
const updateTransactionFn = async (updatedTransaction: any) => {
  const { data } = await api.patch(
    'transaction_test_related_transaction',
    updatedTransaction
  );
  return data;
};

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransactionFn,

    onMutate: async (updatedTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueryData(['transactions'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((transaction: any) =>
          transaction.id === updatedTransaction.transaction_id
            ? { ...transaction, ...updatedTransaction }
            : transaction
        );
      });

      return { previousTransactions };
    },

    onError: (error, _, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ['transactions'],
          context.previousTransactions
        );
      }
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível atualizar a transação. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// --- Delete transaction ---
const deleteTransactionFn = async (transactionId: string) => {
  const { data } = await api.delete('transaction/delete', {
    params: { transaction_id: transactionId },
  });
  return data;
};

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransactionFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível excluir a transação. . Por favor, tente novamente.'
      );
    },
  });
}
