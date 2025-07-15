import { Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@api/api';
import { CategoryProps } from '@interfaces/categories';

const QUERY_KEY = ['categories'];

// --- Create category ---
async function createCategoryFn(newCategory: any) {
  const { data } = await api.post('category', newCategory);
  return data;
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryFn,

    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousCategories =
        queryClient.getQueryData<CategoryProps[]>(QUERY_KEY);
      queryClient.setQueryData<CategoryProps[]>(QUERY_KEY, (old = []) => [
        { ...newCategory, id: `temp-${Date.now()}` },
        ...old,
      ]);
      return { previousCategories };
    },
    onError: (error, newCategory, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QUERY_KEY, context.previousCategories);
      }
      Alert.alert(
        'Adição de categoria',
        'Erro ao adicionar a categoria. Por favor, tente novamente.'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Update category ---
const updateCategoryFn = async (categoryEdited: any) => {
  return await api.patch('category/edit', categoryEdited);
};

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryFn,

    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousCategories =
        queryClient.getQueryData<CategoryProps[]>(QUERY_KEY);
      queryClient.setQueryData<CategoryProps[]>(QUERY_KEY, (old = []) =>
        old.map((category) =>
          category.id === updatedCategory.category_id
            ? { ...category, ...updatedCategory }
            : category
        )
      );
      return { previousCategories };
    },

    onError: (error, newCategory, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QUERY_KEY, context.previousCategories);
      }
      Alert.alert(
        'Edição de categoria',
        'Erro ao editar a categoria. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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

    onMutate: async (categoryIdToDelete) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousCategories =
        queryClient.getQueryData<CategoryProps[]>(QUERY_KEY);
      queryClient.setQueryData<CategoryProps[]>(QUERY_KEY, (old = []) =>
        old.filter((category) => category.id !== categoryIdToDelete)
      );
      return { previousCategories };
    },

    onError: (error, newCategory, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QUERY_KEY, context.previousCategories);
      }
      Alert.alert(
        'Exclusão de categoria',
        'Erro ao excluir categoria. Por favor, tente novamente.'
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
