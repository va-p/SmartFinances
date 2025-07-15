import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';

import { TagProps } from '@components/TagListItem';

const QUERY_KEY = ['tags'];

// --- Create tag ---
const createTagFn = async (newTag: { name: string; user_id: string }) => {
  const { data } = await api.post('tag', newTag);
  return data;
};

export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTagFn,

    onMutate: async (newTag) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTags = queryClient.getQueryData<TagProps[]>(QUERY_KEY);
      queryClient.setQueryData<TagProps[]>(QUERY_KEY, (old = []) => [
        { ...newTag, id: `temp-${Date.now()}` }, // ID otimista
        ...old,
      ]);
      return { previousTags };
    },

    onError: (error, newTag, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(QUERY_KEY, context.previousTags);
      }
      Alert.alert('Erro', 'Não foi possível criar a etiqueta.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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

    onMutate: async (updatedTag) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTags = queryClient.getQueryData<TagProps[]>(QUERY_KEY);
      queryClient.setQueryData<TagProps[]>(QUERY_KEY, (old = []) =>
        old.map((tag) =>
          tag.id === updatedTag.tag_id ? { ...tag, ...updatedTag } : tag
        )
      );
      return { previousTags };
    },

    onError: (error, newTag, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(QUERY_KEY, context.previousTags);
      }
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a etiqueta. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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

    onMutate: async (tagIdToDelete) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTags = queryClient.getQueryData<TagProps[]>(QUERY_KEY);
      queryClient.setQueryData<TagProps[]>(QUERY_KEY, (old = []) =>
        old.filter((tag) => tag.id !== tagIdToDelete)
      );

      // Alert.alert('Exclusão de etiqueta', 'Etiqueta excluída com sucesso!');

      return { previousTags };
    },

    onError: (error, newTag, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(QUERY_KEY, context.previousTags);
      }
      Alert.alert('Erro', 'Não foi possível excluir a etiqueta.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
