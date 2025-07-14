import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';
import { Alert } from 'react-native';

// --- Create account ---
async function createAccountFn(newAccount: any) {
  const { data } = await api.post('account', newAccount);
  return data;
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      //
    },
  });
}

// --- Edit account ---
const editAccountFn = async (accountData: any) => {
  return await api.patch('account/edit', accountData);
};

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editAccountFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Edição de conta',
        'Erro ao editar a conta. Por favor, tente novamente.'
      );
    },
  });
}

// --- Delete account ---
const deleteAccountFn = async (accountID: string) => {
  return await api.delete('account/delete', {
    params: { account_id: accountID },
  });
};

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      Alert.alert('Exclusão de conta', 'Conta excluída com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert(
        'Exclusão de conta',
        'Erro ao excluir conta. Por favor, tente novamente.'
      );
    },
  });
}
