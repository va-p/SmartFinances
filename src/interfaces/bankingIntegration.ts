// Connector is the integration on Pluggy
export interface Connector {
  item: {
    id: string; // "57063906-888f-4cfb-b437-169728a9d769" - O ID da integração (conector) no puggly (hash);
    connector: {
      id: number; // 201 - ID da instituição financeira;
      imageUrl: string; // "https://cdn.pluggy.ai/assets/connector-icons/201.svg" - Imagem da inst. financeira;
      name: string; // "Itaú" - Nome da instituição financeira;
    };
    status: string; // 'UPDATED' - O status desta integração (conector) na Pluggy;
    executionStatus: string; // "SUCCESS" - O status da última execução desta integração (conector) na Pluggy;
  };
}

type HealthTypes = 'ONLINE' | 'UNSTABLE' | 'OFFLINE';

export type StatusTypes =
  | 'UPDATING'
  | 'LOGIN_ERROR'
  | 'OUTDATED'
  | 'WAITING_USER_INPUT'
  | 'UPDATED';

export type ExecutionStatusTypes =
  // Transitive states
  | 'CREATED'
  | 'LOGIN_IN_PROGRESS'
  | 'LOGIN_MFA_IN_PROGRESS'
  | 'ACCOUNTS_IN_PROGRESS'
  | 'CREDITCARDS_IN_PROGRESS'
  | 'TRANSACTIONS_IN_PROGRESS'
  | 'INVESTMENT_TRANSACTIONS_IN_PROGRESS'
  | 'PAYMENT_DATA_IN_PROGRESS'
  | 'IDENTITY_IN_PROGRESS'
  | 'OPPORTUNITIES_IN_PROGRESS'
  | 'MERGING'
  // Final states, Success
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  // Final states, Error
  | 'ERROR'
  | 'MERGE_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'ALREADY_LOGGED_IN'
  | 'SITE_NOT_AVAILABLE'
  | 'INVALID_CREDENTIALS_MFA'
  | 'USER_INPUT_TIMEOUT'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_NEEDS_ACTION'
  | 'USER_NOT_SUPPORTED'
  | 'ACCOUNT_CREDENTIALS_RESET'
  | 'CONNECTION_ERROR'
  | 'USER_AUTHORIZATION_NOT_GRANTED'
  | 'USER_AUTHORIZATION_REVOKED'
  // Final states, Intermediate
  | 'WAITING_USER_INPUT'
  | 'USER_AUTHORIZATION_PENDING';

// BankingIntegration is the integration on database (pluggy data + some internal data)
export interface BankingIntegration {
  id: number;
  createdAt: number;
  userId: number;
  pluggyIntegrationId: string; //uuid
  lastSyncDate: string;
  health: HealthTypes;
  status: StatusTypes;
  executionStatus: ExecutionStatusTypes;
  connectorId: string;
  bankName: string;
}
