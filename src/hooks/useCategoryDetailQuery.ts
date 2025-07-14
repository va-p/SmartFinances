import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { CategoryProps } from '@interfaces/categories';

const fetchCategoryDetail = async (
  categoryId: string
): Promise<CategoryProps> => {
  const { data } = await api.get('category/single', {
    params: {
      category_id: categoryId,
    },
  });
  return data;
};

export function useCategoryDetailQuery(categoryID: string) {
  return useQuery({
    queryKey: ['category', categoryID],
    queryFn: () => fetchCategoryDetail(categoryID),
    enabled: !!categoryID,
  });
}
