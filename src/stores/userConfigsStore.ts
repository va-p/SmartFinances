import { create } from 'zustand';

import { UserConfigs } from '@interfaces/userConfigurations';

export const useUserConfigsStore = create<UserConfigs>((set) => ({
  useLocalAuth: false,
  hideAmount: false,
  hideInsights: false,
  bears: 0,
  // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 }),
  setUseLocalAuth: () =>
    set((state) => ({ useLocalAuth: !state.useLocalAuth })),
  setEnableLocalAuth: () =>
    set((state) => ({ useLocalAuth: (state.useLocalAuth = true) })),
  setHideAmount: () => set((state) => ({ hideAmount: !state.hideAmount })),
  setHideInsights: () =>
    set((state) => ({ hideInsights: !state.hideInsights })),
}));
