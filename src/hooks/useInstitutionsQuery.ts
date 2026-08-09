import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { InstitutionProps } from '@interfaces/institutions';

const fetchInstitutions = async (): Promise<InstitutionProps[]> => {
  const { data } = await api.get('institution');
  return data || [];
};

export function useInstitutionsQuery() {
  return useQuery<InstitutionProps[]>({
    queryKey: ['institutions'],
    queryFn: fetchInstitutions,
  });
}
