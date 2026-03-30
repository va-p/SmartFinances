import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { IconProps } from '@interfaces/categories';

const fetchIcons = async (): Promise<IconProps[]> => {
  const { data } = await api.get('icon');
  return data;
};

export function useIconsQuery() {
  return useQuery({
    queryKey: ['icons'],
    queryFn: () => fetchIcons(),
  });
}
