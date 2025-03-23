import { UserConfigs } from './userConfigurations';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage: string;
  premium?: boolean;
  configs: UserConfigs;
}
