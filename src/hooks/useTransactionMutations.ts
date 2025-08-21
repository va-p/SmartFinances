import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { TransactionProps } from '@interfaces/transactions';

const QUERY_KEY = ['transactions'];

// --- API functions ---
const createTransactionFn = async (newTransaction: any) => {
  return await api.post('transaction', newTransaction);
};
const updateTransactionFn = async (updatedTransaction: any) => {
  return await api.patch('transaction/edit', updatedTransaction);
};
const deleteTransactionFn = async (transactionID: string) => {
  await api.delete('transaction/delete', {
    params: { transaction_id: transactionID },
  });
};

// --- Create transaction ---
export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransactionFn,

    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTransactions =
        queryClient.getQueryData<TransactionProps[]>(QUERY_KEY);

      queryClient.setQueryData<TransactionProps[]>(
        QUERY_KEY,
        (oldData = []) => {
          if (newTransaction.isTransfer) {
            const optimisticDebit = {
              ...newTransaction.debit,
              id: `temp-debit-${Date.now()}`,
            };
            const optimisticCredit = {
              ...newTransaction.credit,
              id: `temp-credit-${Date.now()}`,
            };
            return [optimisticDebit, optimisticCredit, ...oldData];
          }
          const optimisticTransaction = {
            ...newTransaction,
            id: `temp-${Date.now()}`,
          };
          return [optimisticTransaction, ...oldData];
        }
      );

      return { previousTransactions };
    },

    onError: (error, _, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(QUERY_KEY, context.previousTransactions);
      }
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível registrar a transação. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// --- Update transaction ---
export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransactionFn,

    onMutate: async (updatedTransaction) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previousTransactions =
        queryClient.getQueryData<TransactionProps[]>(QUERY_KEY);

      queryClient.setQueryData<TransactionProps[]>(QUERY_KEY, (old = []) =>
        old.map((transaction) =>
          transaction.id === updatedTransaction.transaction_id
            ? { ...transaction, ...updatedTransaction }
            : transaction
        )
      );

      return { previousTransactions };
    },

    onError: (error, _, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(QUERY_KEY, context.previousTransactions);
      }
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível atualizar a transação. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// --- Delete transaction ---
export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransactionFn,

    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTransactions =
        queryClient.getQueryData<TransactionProps[]>(QUERY_KEY);
      queryClient.setQueryData<TransactionProps[]>(QUERY_KEY, (old = []) =>
        old.filter((transaction) => transaction.id !== transactionId)
      );
      return { previousTransactions };
    },

    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível excluir a transação. . Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
