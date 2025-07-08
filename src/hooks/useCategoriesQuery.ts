import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { CategoryProps } from '@interfaces/categories';

const fetchCategories = async (userID: string): Promise<CategoryProps[]> => {
  const { data } = await api.get('category', {
    params: {
      user_id: userID,
    },
  });
  return data || [];
};

export function useCategoriesQuery(userID: string | undefined) {
  return useQuery({
    queryKey: ['categories', userID],
    queryFn: () => fetchCategories(userID!),
    enabled: !!userID,
  });
}
