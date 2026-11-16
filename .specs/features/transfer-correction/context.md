# Transfer Correction Context

**Gathered:** 2026-11-16
**Spec:** `.specs/features/transfer-correction/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Fix two Openi-import repair flows in `RegisterTransaction` (edit mode only): (1) converting an imported plain CREDIT/DEBIT into a transfer when the counterpart leg never imported, with correct direction and no balance corruption on synced accounts; (2) marking Aplicação/Resgate RDB rows as transfers without picking among indistinguishable investment accounts (single-leg transfer). No auto-detection, no bulk convert, no investment-picker redesign.

---

## Implementation Decisions

### Area 1 — Transfer direction picker (swap toggle)

- Direction toggle is a circular swap button (double-arrow icon) next to the counterpart selector; it toggles the second selector between "Selecione a conta de destino" and "Selecione a conta de origem".
- Default mode derives from the stored type: unlinked DEBIT → destination mode (pending `TRANSFER_DEBIT`); unlinked CREDIT → source mode (pending `TRANSFER_CREDIT`).
- Toggling swaps the label AND the pending primary type (`TRANSFER_DEBIT` ↔ `TRANSFER_CREDIT`); the picked account is recorded as destination (destination mode) or source (source mode).
- Scope is conversion only (unlinked plain → transfer). Editing an already-linked transfer keeps today's behavior (second selector = counterpart account, no swap control).

### Area 2 — Balance effect on bank-integrated accounts

- Option A confirmed: creating the missing counterpart leg does NOT touch the stored balance of a counterpart account that has a bank integration (`bankingIntegrationId != null`); the row is created for history/pairing only.
- Manual counterparts keep today's behavior (standard balance increment on the counterpart account).
- Primary-leg handling is unchanged (reverse old effect + apply new effect on the same account = net zero on conversion).
- Linked-transfer sync/unlink paths (`doSync`/`doUnlink`) keep current behavior — out of scope.

### Area 3 — Single-leg transfers

- User corrected the premise: transfers DO affect balance/calculations for manual accounts (as today); only bank-integrated accounts avoid balance changes.
- Single-leg is edit-only (no create-mode), stored as unlinked `TRANSFER_CREDIT` (from CREDIT) or `TRANSFER_DEBIT` (from DEBIT) with `relatedTransactionId = null`.
- Counterpart slot shows "Sem conta vinculada"; the transfer-link row stays hidden while unlinked.
- Unlinked transfer legs are excluded from income/expense totals exactly like linked legs. Balance effect on the primary account is net zero by construction (same sign before/after), which satisfies both manual (unchanged) and synced (untouched) cases.
- Bulk edit cannot create single-leg transfers (per-leg contract stays).

### Agent's Discretion

- Exact swap-icon asset, placement pixels, and animation — follow existing `SelectButton`/icon patterns.
- Exact "same account" validation message wording (PT-BR, matching existing alert tone).
- Whether "Sem conta vinculada" is a row inside the account picker vs. an empty-state of the selector — pick whichever fits `AccountDestinationSelect` with less code.

### Declined / Undiscussed Gray Areas → Assumptions

- None — all four areas were discussed and decided (see spec Assumptions table for the recorded defaults).

---

## Specific References

- User pointed at screenshot 1 (Aplicação RDB −R$300/−R$500/−R$250/−R$700 and Resgate RDB +R$500/+R$1.500 imported as expense/income on "Nubank • Conta corrente") and screenshot 2 (indistinguishable "Nubank • CDB - NU FINANCEIRA S.A. ..." rows, the reason investment-consolidation groups them).
- User explicitly proposed the circular double-arrow swap button toggling "Select destination account" ↔ "Select source account".

---

## Deferred Ideas

- **Investment picker disambiguation** (surface `rate`/`rateType`/`expiresAt` chips from investment-consolidation in `AccountDestinationSelect` so users CAN pick a real RDB counterparty when they want to). Documented to implement soon — separate feature, not this spec.
- Auto-detecting Aplicação/Resgate (description/`operationType` pattern) as transfers at import or offering bulk convert.
- Widening the Openi auto-linker (`transferMatcher`) to match unlinked single-leg rows when the late counterpart imports (auto-heal). Manual linking covers the need; the strict auto-matcher stays untouched by design.
