import { create } from 'zustand';

import { UserConfigs } from '@interfaces/userConfigurations';

export const useUserConfigs = create<UserConfigs>((set) => ({
  useLocalAuth: false,
  hideAmount: false,
  insights: true,
  setUseLocalAuth: () =>
    set((state) => ({ useLocalAuth: !state.useLocalAuth })),
  setEnableLocalAuth: () =>
    set((state) => ({ useLocalAuth: (state.useLocalAuth = true) })),
  setHideAmount: () => set((state) => ({ hideAmount: !state.hideAmount })),
  setInsights: () => set((state) => ({ insights: !state.insights })),
}));
