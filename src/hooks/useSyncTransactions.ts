import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

function syncAndFetchTransactions() {
  return api.get('/banking-integration/sync');
}

export function useSyncTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAndFetchTransactions,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },

    onError: () => {
      Alert.alert(
        'Sincronização Falhou',
        'Não foi possível atualizar suas contas. Por favor, tente novamente mais tarde.'
      );
    },
  });
}
