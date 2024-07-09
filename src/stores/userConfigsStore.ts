import { create } from 'zustand';

type UserConfigs = {
  useLocalAuth: boolean;
  setUseLocalAuth: (useLocalAuth: boolean) => void;
  hideAmount: boolean;
  setHideAmount: (hideAmount: boolean) => void;
  insights: boolean;
  setInsights: (insights: boolean) => void;
};

export const useUserConfigs = create<UserConfigs>((set) => ({
  useLocalAuth: false,
  hideAmount: false,
  insights: true,
  setUseLocalAuth: (useLocalAuth) =>
    set(() => ({ useLocalAuth: useLocalAuth })),
  setHideAmount: (hideAmount) => set(() => ({ hideAmount: hideAmount })),
  setInsights: (insights) => set(() => ({ insights: insights })),
}));
