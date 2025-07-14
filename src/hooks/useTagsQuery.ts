import { useQuery } from '@tanstack/react-query';

import { TagProps } from '@components/TagListItem';

import api from '@api/api';

const fetchTags = async (userID: string | null): Promise<TagProps[]> => {
  const { data } = await api.get('tag', {
    params: {
      user_id: userID,
    },
  });
  return data;
};

export function useTagsQuery(userID: string | undefined) {
  return useQuery<TagProps[]>({
    queryKey: ['tags', userID],
    queryFn: () => fetchTags(userID!),
    enabled: !!userID,
  });
}
