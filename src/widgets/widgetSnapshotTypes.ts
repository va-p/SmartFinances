// Shared widget snapshot model (WDG backbone).
// Single source of truth for the JS → native widget bridge: the snapshot is
// computed in TypeScript and rendered verbatim by WidgetKit / AppWidget code,
// which never runs business logic. Versioned for forward-compatible parsing.

export interface WidgetBudgetRow {
  id: string;
  name: string;
  percent: number;
  percentLabel: string;
  statusText: string;
  over: boolean;
}

export interface WidgetCashFlow {
  monthLabel: string;
  income: string;
  expenses: string;
  bars: Array<{ income: number; expense: number }>;
}

export interface WidgetOverview {
  total: string;
  alertName: string | null;
  alertPercent: string | null;
  alertOver: boolean;
  criticalName: string | null;
  criticalPercent: string | null;
}

export interface WidgetNetWorth {
  total: string;
  spark: number[];
  donut: Array<{ categoryId: string; value: number; label: string }>;
}

export interface WidgetInstitutionRow {
  id: string;
  name: string;
  accountCount: number;
  balance: string;
}

export interface WidgetSnapshot {
  version: 1;
  generatedAt: string;
  signedIn: boolean;
  hidden: boolean;
  baseCurrencyCode: string;
  budgets: WidgetBudgetRow[];
  cashFlow: WidgetCashFlow;
  overview: WidgetOverview;
  netWorth: WidgetNetWorth;
  institutions: WidgetInstitutionRow[];
}

export interface SnapshotInput {
  budgets: WidgetBudgetRow[];
  cashFlow: WidgetCashFlow;
  overview: WidgetOverview;
  netWorth: WidgetNetWorth;
  institutions: WidgetInstitutionRow[];
  hidden: boolean;
  signedIn: boolean;
  baseCurrencyCode: string;
  generatedAt?: string;
}
