import { create } from 'zustand';

import { AccountProps } from '@interfaces/accounts';

type GoalAccountsSelected = {
  goalAccountsSelected: AccountProps[];
  setGoalAccountsSelected: (accounts: AccountProps[]) => void;
};

export const useGoalAccountsSelected = create<GoalAccountsSelected>((set) => ({
  goalAccountsSelected: [],
  setGoalAccountsSelected: (accounts: AccountProps[]) =>
    set(() => ({ goalAccountsSelected: accounts })),
}));
