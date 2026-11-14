// Benefits-tiers: restriction state of the linked integration (BEN-47)
export type AccessStatus = 'ACTIVE' | 'RESTRICTED';

export type StatusTypes =
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'MERGING'
  | 'OUT_OF_SYNC'
  | 'AUTH_ERROR'
  | 'WAITING_USER_INPUT'
  | 'UPDATING'
  // Legacy Pluggy values, kept for rows synced before the migration
  | 'LOGIN_ERROR'
  | 'OUTDATED'
  | 'UPDATED';

// BankingIntegration is the integration on database (provider data + some internal data)
export interface BankingIntegration {
  id: number;
  createdAt: number;
  userId: number;
  provider: string;
  providerIntegrationId: string; // uuid
  lastSyncDate: string;
  status: StatusTypes;
  connectorId: string;
  bankName: string;
  access_status: AccessStatus;
}
