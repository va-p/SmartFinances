import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

// --- Create tag ---
const createTagFn = async (newTag: { name: string; user_id: string }) => {
  return await api.post('tag', newTag);
};

export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTagFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: any) => {
      //
    },
  });
}

// --- Update tag ---
const updateTagFn = async (tagEdited: { tag_id: string; name: string }) => {
  return await api.patch('tag/edit', tagEdited);
};

export function useUpdateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTagFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: any) => {
      //
    },
  });
}

// --- Delete tag ---
const deleteTagFn = async (tagId: string) => {
  return await api.delete('tag/delete', { params: { tag_id: tagId } });
};

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      Alert.alert('Exclusão de etiqueta', 'Etiqueta excluída com sucesso!');
    },
    onError: (error: any) => {
      //
    },
  });
}
