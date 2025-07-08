import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../api/api';

async function syncAndFetchTransactions(userID: string) {
  return await api.get('/banking_integration/fetch_transactions', {
    params: {
      user_id: userID,
    },
  });
}

export function useSyncTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAndFetchTransactions,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },

    onError: (error) => {
      console.error('Erro na sincronização:', error);
      Alert.alert(
        'Sincronização Falhou',
        'Não foi possível atualizar suas contas. Por favor, tente novamente mais tarde.'
      );
    },
  });
}
