import { create } from 'zustand';

import { UserRole } from '@interfaces/user';

type User = {
  tenantId: string;
  setTenantId: (tenantId: string) => void;
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
};

export const useUser = create<User>((set) => ({
  tenantId: '',
  setTenantId: (tenantId) => set(() => ({ tenantId: tenantId })),
  id: '',
  setId: (id) => set(() => ({ id: id })),
  name: '',
  setName: (name) => set(() => ({ name: name })),
  lastName: '',
  setLastName: (lastName) => set(() => ({ lastName: lastName })),
  email: '',
  setEmail: (email) => set(() => ({ email: email })),
  phone: '',
  setPhone: (phone) => set(() => ({ phone: phone })),
  role: 'user',
  setRole: (role) => set(() => ({ role: role })),
  profileImage: '',
  setProfileImage: (profileImage) =>
    set(() => ({ profileImage: profileImage })),
}));
