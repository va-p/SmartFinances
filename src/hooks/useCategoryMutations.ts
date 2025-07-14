import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';
import { Alert } from 'react-native';

// --- Create category ---
async function createCategoryFn(newCategory: any) {
  const { data } = await api.post('category', newCategory);
  return data;
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Adição de categoria',
        'Erro ao adicionar a categoria. Por favor, tente novamente.'
      );
    },
  });
}

// --- Edit category ---
const editCategoryFn = async (categoryEdited: any) => {
  return await api.patch('category/edit', categoryEdited);
};

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCategoryFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Alert.alert('Edição de categoria', 'Categoria editada com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert(
        'Edição de categoria',
        'Erro ao editar a categoria. Por favor, tente novamente.'
      );
    },
  });
}

// --- Delete category ---
const deleteCategoryFn = async (categoryID: string) => {
  return await api.delete('category/delete', {
    params: { category_id: categoryID },
  });
};

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Alert.alert('Exclusão de categoria', 'Categoria excluída com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert(
        'Exclusão de categoria',
        'Erro ao excluir categoria. Por favor, tente novamente.'
      );
    },
  });
}
