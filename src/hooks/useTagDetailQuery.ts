import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { TagProps } from '@components/TagListItem';

const fetchTagDetail = async (tagID: string): Promise<TagProps> => {
  const { data } = await api.get('tag/single', { params: { tag_id: tagID } });
  return data;
};

export function useTagDetailQuery(tagID: string) {
  return useQuery({
    queryKey: ['tag', tagID],
    queryFn: () => fetchTagDetail(tagID),
    enabled: !!tagID,
  });
}
