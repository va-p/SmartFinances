import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { GoalDetailsProps } from '@interfaces/goals';

const fetchGoalDetail = async (goalID: string): Promise<GoalDetailsProps> => {
  const { data } = await api.get(`goal/${goalID}`);
  return data;
};

export function useGoalDetailQuery(goalID: string) {
  return useQuery({
    queryKey: ['goal', goalID],
    queryFn: () => fetchGoalDetail(goalID),
    enabled: !!goalID,
  });
}
