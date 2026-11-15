import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

// --- Delete banking integration (with cascade on the backend) ---
const deleteBankingIntegrationFn = async (bankingIntegrationID: string) =>
  api.delete(`banking-integration/${bankingIntegrationID}`);

export function useDeleteBankingIntegrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBankingIntegrationFn,

    onError: () => {
      Alert.alert(
        'Exclusão de conexão',
        'Erro ao excluir a conexão. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bankingIntegration'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
