import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { ColorProps } from '@interfaces/categories';

const fetchColors = async (): Promise<ColorProps[]> => {
  const { data } = await api.get('color');
  return data;
};

export function useColorsQuery() {
  return useQuery({
    queryKey: ['colors'],
    queryFn: fetchColors,
  });
}
