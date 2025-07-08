import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

// --- Create transaction ---
async function createTransactionFn(newTransaction: any) {
  const { data } = await api.post('transaction', newTransaction);
  return data;
}

// --- Create transfer transaction ---
async function createTransferFn(payload: { debit: any; credit: any }) {
  const [debitResponse, creditResponse] = await Promise.all([
    api.post('transaction', payload.debit),
    api.post('transaction', payload.credit),
  ]);
  return { debit: debitResponse.data, credit: creditResponse.data };
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      if (payload.isTransfer) {
        const { isTransfer, ...transferPayload } = payload;
        return createTransferFn(transferPayload);
      } else {
        return createTransactionFn(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      Alert.alert('Sucesso!', 'Transação registrada com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível registrar a transação.'
      );
    },
  });
}

// --- Update transaction ---
const updateTransactionFn = async (updatedTransaction: any) => {
  const { data } = await api.patch('transaction/edit', updatedTransaction);
  return data;
};

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTransactionFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      Alert.alert('Sucesso!', 'Transação atualizada com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível atualizar a transação. Por favor, tente novamente.'
      );
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
      Alert.alert('Sucesso!', 'Transação excluída com sucesso!');
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
