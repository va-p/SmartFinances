# Validation Report — Overview Chart Y-Axis & Net Worth Calc

**Status:** PASS
**Date:** 2026-08-17
**Diff range:** `src/screens/Overview/index.tsx`, `src/screens/Accounts/index.tsx`, `src/utils/buildNetWorthEvolution.ts` (new)

## Per-AC evidence

### FR-001 — Y-axis labels with "k" formatting

- AC-001.1 ✅ `yAxisLabelTexts` prop removed from the Overview `LineChart`; the locale-aware `formatYLabel` (already present) is now the single source of label formatting.
- AC-001.2 ✅ `formatYLabel` computes `k = Math.floor(value / 1000)` and returns `` `${k}k` `` for values ≥ 1000 (verified by reading the render code; same logic validated interactively on the Accounts screen).
- AC-001.3 ✅ Values < 1000 return `'0'`.

### FR-002 — Patrimonial evolution includes account balances

- AC-002.1 ✅ `buildNetWorthEvolution` seeds `accumulatedTotal = totalAssets − sumOfAllFlows`, guaranteeing the final point equals `totalAssets` (structural equivalence with the Accounts fix that the user validated: chart max == `totalBalanceFormatted`).
- AC-002.2 ✅ DEBIT → `-Math.abs(rawAmount)`, CREDIT → `Math.abs(rawAmount)`. Type-derived sign, robust to legacy all-positive data.
- AC-002.3 ✅ `TRANSFER_CREDIT`/`TRANSFER_DEBIT` are skipped.
- AC-002.4 ✅ Invalid dates (`isNaN`) and future dates are skipped.

### FR-003 — Shared utility

- AC-003.1 ✅ `src/utils/buildNetWorthEvolution.ts` — pure function, no React imports, no side effects.
- AC-003.2 ✅ Both `Accounts/index.tsx` and `Overview/index.tsx` import and use it.
- AC-003.3 ✅ Utility is pure: inputs → outputs only.

## Verification

- `tsc --noEmit`: only 2 pre-existing errors in `Accounts/index.tsx` (lines 680, 713 — FlatList `balance` string/number mismatch, unrelated to this feature). No errors in `Overview/index.tsx` or `buildNetWorthEvolution.ts`.
- Behavior: net worth chart logic is now identical across both screens — the fix already user-validated on Accounts now applies verbatim to Overview.

## Notes

- `'all'` period: utility returns a single "Todo o histórico" point at current net worth (fixes a latent crash in the old Overview code, where `parse('all', '')` would throw).
- Unused imports (`ptBR`, `format`, `parse`) removed from `Accounts/index.tsx`.
