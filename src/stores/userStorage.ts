import { create } from 'zustand';

import { UserRole } from '@interfaces/user';

type User = {
  id: string;
  setId: (id: string) => void;
  name: string;
  setName: (name: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  profileImage: string;
  setProfileImage: (profileImage: string) => void;
  premium: boolean;
  setPremium: (premium: boolean) => void;
};

export const useUser = create<User>((set) => ({
  id: '',
  setId: (id) => set(() => ({ id })),
  name: '',
  setName: (name) => set(() => ({ name })),
  lastName: '',
  setLastName: (lastName) => set(() => ({ lastName })),
  email: '',
  setEmail: (email) => set(() => ({ email })),
  phone: '',
  setPhone: (phone) => set(() => ({ phone })),
  role: 'user',
  setRole: (role) => set(() => ({ role })),
  profileImage: '',
  setProfileImage: (profileImage) =>
    set(() => ({ profileImage })),
  premium: false,
  setPremium: (premium) => set(() => ({ premium })),
}));
