import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { CategoryProps } from '@interfaces/categories';

const fetchCategories = async (): Promise<CategoryProps[]> => {
  const { data } = await api.get('category');
  return data || [];
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}
