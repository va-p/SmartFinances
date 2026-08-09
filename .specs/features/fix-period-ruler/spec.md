# Fix PeriodRuler — Crash & Missing Periods

## FR-001: Guard against invalid dates in Account's `_renderPeriodRuler`

**Problem:** `format(item.created_at, 'yyyy-MM', { locale: ptBR })` at `Account/index.tsx:247` throws `RangeError: Invalid time value` because `item.created_at` is a `dd/MM/yyyy` string, but `date-fns` `format` expects a `Date` object.

**Acceptance Criteria:**
- AC-001.1: `_renderPeriodRuler` no longer crashes when iterating over transactions.
- AC-001.2: Transactions with invalid/missing `created_at` are silently skipped (logged at most).
- AC-001.3: Valid transactions continue to be grouped and displayed correctly in the PeriodRuler.

## FR-002: PeriodRuler always shows full period range

**Problem:** The PeriodRuler (both on Account and Home screens) only displays periods (months/years) where transactions exist. It should always display the full range:
- **Months mode:** all 12 months of the selected year, regardless of transactions.
- **Years mode:** all years from the earliest transaction year to the current year.

**Acceptance Criteria:**
- AC-002.1: On the Home screen, when period is "months", all 12 months of the selected year are always visible in the PeriodRuler.
- AC-002.2: On the Home screen, when period is "years", all years from earliest transaction year to current year are visible.
- AC-002.3: On the Account screen, same behavior as AC-002.1 and AC-002.2.
- AC-002.4: The currently-selected month/year shows as active (highlighted) in the ruler.
- AC-002.5: Prev/Next navigation works correctly: in months mode, moves one month; in years mode, moves one year.
- AC-002.6: When there are no transactions at all, the PeriodRuler still shows all months (same as current fallback behavior, now unified).
- AC-002.7: The `mocks` fallback in Home's `PeriodRulerList.tsx` is removed as the generation becomes unified.
