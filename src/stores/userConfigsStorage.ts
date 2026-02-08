import { create } from 'zustand';

type UserConfigs = {
  useLocalAuth: boolean;
  setUseLocalAuth: (useLocalAuth: boolean) => void;
  hideAmount: boolean;
  setHideAmount: (hideAmount: boolean) => void;
  insights: boolean;
  setInsights: (insights: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
};

export const useUserConfigs = create<UserConfigs>((set) => ({
  useLocalAuth: false,
  hideAmount: false,
  insights: true,
  darkMode: false,
  setUseLocalAuth: (useLocalAuth) =>
    set(() => ({ useLocalAuth: useLocalAuth })),
  setHideAmount: (hideAmount) => set(() => ({ hideAmount: hideAmount })),
  setInsights: (insights) => set(() => ({ insights: insights })),
  setDarkMode: (darkMode) => set(() => ({ darkMode: darkMode })),
}));
