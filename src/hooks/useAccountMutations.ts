import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

const QUERY_KEY = ['accounts'];

// --- Create account ---
async function createAccountFn(newAccount: any) {
  const { data } = await api.post('account', newAccount);
  return data;
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountFn,

    onMutate: async (newAccount) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousAccounts =
        queryClient.getQueryData<AccountProps[]>(QUERY_KEY);
      queryClient.setQueryData<AccountProps[]>(QUERY_KEY, (old = []) => [
        { ...newAccount, id: `temp-${Date.now()}` },
        ...old,
      ]);
      return { previousAccounts };
    },

    onError: (err, newAccount, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(QUERY_KEY, context.previousAccounts);
      }
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Update account ---
const updateAccountFn = async (accountData: any) => {
  return await api.patch('account/edit', accountData);
};

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccountFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onMutate: async (updatedAccount) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousAccounts =
        queryClient.getQueryData<AccountProps[]>(QUERY_KEY);
      queryClient.setQueryData<AccountProps[]>(QUERY_KEY, (old = []) =>
        old.map((account) =>
          account.id === updatedAccount.account_id
            ? { ...account, ...updatedAccount }
            : account
        )
      );
      return { previousAccounts };
    },

    onError: (error, newAccount, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(QUERY_KEY, context.previousAccounts);
      }
      Alert.alert(
        'Edição de conta',
        'Erro ao editar a conta. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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

    onMutate: async (accountIdToDelete) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousAccounts =
        queryClient.getQueryData<AccountProps[]>(QUERY_KEY);
      queryClient.setQueryData<AccountProps[]>(QUERY_KEY, (old = []) =>
        old.filter((account) => account.id !== accountIdToDelete)
      );
      return { previousAccounts };
    },

    onError: (error, newAccount, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(QUERY_KEY, context.previousAccounts);
      }
      Alert.alert(
        'Exclusão de conta',
        'Erro ao excluir conta. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
