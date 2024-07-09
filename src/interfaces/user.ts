import { UserConfigs } from './userConfigurations';

export type UserRole = 'admin' | 'user';

export interface User {
  tenantId: string;
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage: string;
  configs: UserConfigs;
}
