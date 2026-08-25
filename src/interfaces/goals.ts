import { CurrencyCodes } from './currencies';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type GoalStatusAction = 'conclude' | 'archive' | 'unarchive';

interface GoalCurrencyProps {
  id: number;
  code: CurrencyCodes;
  symbol: string;
}

export interface GoalReserveAccountProps {
  id: number;
  name: string;
  balance: number;
  is_virtual: boolean;
  currency_id: number;
}

export interface GoalLinkedAccountProps {
  id: number;
  name: string;
  balance: number;
  currency: GoalCurrencyProps;
  type: string;
}

// Mirrors formatGoal in the backend goal controller (design.md §API DTO).
export interface GoalProps {
  id: string;
  name: string;
  target_amount: string;
  status: GoalStatus;
  deadline: string | null;
  completed_at: string | null;
  currency: GoalCurrencyProps;
  reserve_account: GoalReserveAccountProps;
  linked_accounts: GoalLinkedAccountProps[];
  created_at: string;
  updated_at: string;
}

export interface GoalReserveTransactionProps {
  id: number;
  description: string;
  amount: number;
  type: string;
  transaction_date: string;
  created_at: string;
  category: { id: string; name: string };
  related_transaction_id: number | null;
}

// GET /goal/:id = goal + reserve transfer-leg history, newest first (GOAL-17).
export interface GoalDetailsProps extends GoalProps {
  transactions: GoalReserveTransactionProps[];
}
