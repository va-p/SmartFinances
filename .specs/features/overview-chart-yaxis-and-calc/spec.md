# Overview Screen — Y-Axis Labels & Net Worth Calculation Fix

## FR-001: Y-axis labels with "k" formatting on Overview LineChart

**Problem:** Same bug fixed on the Accounts screen: `yAxisLabelTexts` and `formatYLabel` conflict. The chart library ignores `yAxisLabelTexts` for display, so raw values (e.g. "36670") appear without the "k" suffix.

**Acceptance Criteria:**
- AC-001.1: Remove `yAxisLabelTexts` prop; keep the locale-aware `formatYLabel` (already in place).
- AC-001.2: Y-axis labels render with "k" suffix (e.g. "36k") for values ≥ 1000.
- AC-001.3: Labels below 1000 render as "0" (consistent with Accounts screen).

## FR-002: Patrimonial evolution includes account balances

**Problem:** `patrimonialEvolution` starts `accumulatedTotal` at 0 and only accumulates transaction flows — identical bug fixed on the Accounts screen. The final chart point must equal the current total net worth.

**Acceptance Criteria:**
- AC-002.1: Seed `accumulatedTotal` with `totalAssets - sumOfAllFlows` so the final point equals `totalAssets`.
- AC-002.2: DEBIT transactions reduce net worth; CREDIT increase it (sign derived from type, robust to old all-positive data).
- AC-002.3: Transfer transactions are excluded.
- AC-002.4: Invalid/future transaction dates are skipped.

## FR-003: Extract shared net worth calculation to a utility

**Problem:** Accounts and Overview now have near-identical net worth evolution logic. Duplicated code violates DRY and makes future changes error-prone.

**Acceptance Criteria:**
- AC-003.1: Create `src/utils/buildNetWorthEvolution.ts` exporting a pure function that takes `{ transactions, totalAssets, period, selectedDate }` and returns `{ date, total }[]`.
- AC-003.2: Both Accounts and Overview use the utility.
- AC-003.3: Utility is pure — no side effects, no state, no React imports.
