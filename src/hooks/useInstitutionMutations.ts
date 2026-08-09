import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { InstitutionProps } from '@interfaces/institutions';

const QUERY_KEY = ['institutions'];

// --- Create institution ---
const createInstitutionFn = async (newInstitution: {
  name: string;
}): Promise<InstitutionProps> => {
  // NOTE: intentionally does not catch/wrap errors here — the caller (e.g.
  // InstitutionSelect's inline quick-add) needs the raw AxiosError to
  // distinguish a 409 conflict (error.response?.status === 409) from other
  // failures, per AC11.5.
  const { data } = await api.post('institution', newInstitution);
  return data;
};

export function useCreateInstitutionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInstitutionFn,

    onMutate: async (newInstitution) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousInstitutions = queryClient.getQueryData<
        InstitutionProps[]
      >(QUERY_KEY);
      queryClient.setQueryData<InstitutionProps[]>(QUERY_KEY, (old = []) => [
        { ...newInstitution, id: `temp-${Date.now()}` }, // ID otimista
        ...old,
      ]);
      return { previousInstitutions };
    },

    onError: (error, newInstitution, context) => {
      if (context?.previousInstitutions) {
        queryClient.setQueryData(QUERY_KEY, context.previousInstitutions);
      }
      // Callers that need to branch on a 409 conflict (AC11.5) should inspect
      // error.response?.status themselves before this generic Alert fires
      // (e.g. by handling the error at the call site instead of relying only
      // on this hook's onError). This Alert still fires as the default UX
      // for non-conflict failures.
      Alert.alert('Erro', 'Não foi possível criar a instituição.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// --- Update institution ---
const updateInstitutionFn = async (institutionEdited: {
  institution_id: string;
  name: string;
}) => {
  return await api.patch(`institution/${institutionEdited.institution_id}`, {
    name: institutionEdited.name,
  });
};

export function useUpdateInstitutionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInstitutionFn,

    onMutate: async (updatedInstitution) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousInstitutions = queryClient.getQueryData<
        InstitutionProps[]
      >(QUERY_KEY);
      queryClient.setQueryData<InstitutionProps[]>(QUERY_KEY, (old = []) =>
        old.map((institution) =>
          institution.id === updatedInstitution.institution_id
            ? { ...institution, name: updatedInstitution.name }
            : institution
        )
      );
      return { previousInstitutions };
    },

    onError: (error, newInstitution, context) => {
      if (context?.previousInstitutions) {
        queryClient.setQueryData(QUERY_KEY, context.previousInstitutions);
      }
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a instituição. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// --- Delete institution ---
const deleteInstitutionFn = async (institutionId: string) => {
  return await api.delete(`institution/${institutionId}`);
};

export function useDeleteInstitutionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInstitutionFn,

    onMutate: async (institutionIdToDelete) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousInstitutions = queryClient.getQueryData<
        InstitutionProps[]
      >(QUERY_KEY);
      queryClient.setQueryData<InstitutionProps[]>(QUERY_KEY, (old = []) =>
        old.filter((institution) => institution.id !== institutionIdToDelete)
      );

      return { previousInstitutions };
    },

    onError: (error, newInstitution, context) => {
      if (context?.previousInstitutions) {
        queryClient.setQueryData(QUERY_KEY, context.previousInstitutions);
      }
      Alert.alert('Erro', 'Não foi possível excluir a instituição.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
