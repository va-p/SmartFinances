import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { GoalProps } from '@interfaces/goals';

const fetchGoals = async (): Promise<GoalProps[]> => {
  const { data } = await api.get('goal');
  return data;
};

export function useGoalsQuery() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => fetchGoals(),
  });
}
