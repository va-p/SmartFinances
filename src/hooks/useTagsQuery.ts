import { useQuery } from '@tanstack/react-query';

import { TagProps } from '@components/TagListItem';

import api from '@api/api';

const fetchTags = async (): Promise<TagProps[]> => {
  const { data } = await api.get('tag');
  return data;
};

export function useTagsQuery() {
  return useQuery<TagProps[]>({
    queryKey: ['tags'],
    queryFn: () => fetchTags(),
  });
}
