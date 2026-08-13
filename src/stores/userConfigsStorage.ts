import { create } from 'zustand';

export type SortingOption =
  | 'name-asc'
  | 'name-desc'
  | 'balance-asc'
  | 'balance-desc';

type UserConfigs = {
  useLocalAuth: boolean;
  setUseLocalAuth: (useLocalAuth: boolean) => void;
  hideAmount: boolean;
  setHideAmount: (hideAmount: boolean) => void;
  insights: boolean;
  setInsights: (insights: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (notificationsEnabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  sortingOption: SortingOption;
  setSortingOption: (sortingOption: SortingOption) => void;
};

export const useUserConfigs = create<UserConfigs>((set) => ({
  useLocalAuth: false,
  hideAmount: false,
  insights: true,
  notificationsEnabled: true,
  darkMode: false,
  sortingOption: 'name-asc',
  setUseLocalAuth: (useLocalAuth) =>
    set(() => ({ useLocalAuth: useLocalAuth })),
  setHideAmount: (hideAmount) => set(() => ({ hideAmount: hideAmount })),
  setInsights: (insights) => set(() => ({ insights: insights })),
  setNotificationsEnabled: (notificationsEnabled) =>
    set(() => ({ notificationsEnabled: notificationsEnabled })),
  setDarkMode: (darkMode) => set(() => ({ darkMode: darkMode })),
  setSortingOption: (sortingOption) =>
    set(() => ({ sortingOption: sortingOption })),
}));
