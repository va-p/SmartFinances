# Financial Goals / Savings Targets Context

**Gathered:** 2026-08-25
**Spec:** `.specs/features/financial-goals/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Financial Goals let users set savings targets (name, target amount, currency, optional deadline), track progress via explicit internal transfers into a per-goal virtual reserve account plus full balances of optionally linked real accounts, and manage the lifecycle: active → completed → archived. Entry point is a new "Metas & Objetivos" item in OptionsMenu. Virtual reserve accounts are visible only inside the Goals flow, never in the Accounts tab or regular account pickers, but their balances count toward Total Net Worth ("Patrimônio Total"). Deposits/withdrawals are real TRANSFER transaction pairs (existing two-leg transfer model). Backend work happens in the `smart-finances-backend` repo.

---

## Implementation Decisions

### Progress semantics (discussed)

- Current amount of a goal = virtual reserve account balance + **full current balances** of all linked real accounts ("this account IS my caixinha" mental model). No separate contribution ledger.

### Completion & lifecycle (discussed)

- Auto-flag: when progress reaches ≥ 100%, the goal shows a "Meta atingida" state — it does NOT move itself.
- Manual conclude: user taps "Concluir" to move the goal to COMPLETED (also allowed below 100%).
- Unarchive restores the goal to its previous status (ACTIVE → ACTIVE, COMPLETED → COMPLETED).

### Deleting goals with funds (discussed)

- Delete flow includes a transfer-back step: if the virtual reserve balance is > 0, the user picks a destination account and the app transfers the full balance back before deleting, atomically.
- Linked real accounts are simply unlinked — their money never moves.

### Deposit/withdraw UX & currency (discussed)

- Multi-currency from day one: goal currency picked at creation (default BRL); virtual reserve account created in that currency.
- Deposits accepted from accounts in any currency, reusing the existing transfer conversion (`amount_in_account_currency` per leg).
- Linked accounts in other currencies convert into the goal currency at current quotes (same math as net worth).
- Source account for a deposit is picked per operation (pre-selecting the user's default account).

### Reserve existence & API exposure (discussed 2026-08-27, user decision — supersedes earlier assumptions)

- Reserve accounts are created ONLY when the goal has no linked accounts (at creation, or when an edit removes the last linked account). Linked-only goals have no reserve.
- Deposits/withdrawals on linked-only goals move money directly in/out of a chosen linked account (transfer from/to any real account). The movement sheet offers the goal's linked accounts as the second picker, auto-selected when only one.
- Withdrawal bound applies to the chosen source: reserve balance, or the chosen linked account's balance.
- `GET /account` excludes virtual accounts by default; `?include_virtual=true` opts in; the account DTO always exposes `isVirtual`. The Accounts screen (net worth) is the include-virtual consumer; pickers/lists use the default exclusion.

### Agent's Discretion

- Exact visual layout of goal cards, details screen, and create/edit form (follow Budgets feature patterns).
- Technical discriminator for virtual reserve accounts in the Account model (decided in Design).
- Backend module shape (routes/controller/service following budget/transfer conventions).

### Declined / Undiscussed Gray Areas → Assumptions

- ~~Whether every goal always owns a virtual reserve account~~ — resolved by user 2026-08-27: reserve only when no accounts linked.
- Whether goal-linked real accounts can be deleted — assumption: deleting unlinks them and progress recalculates.

---

## Specific References

- UI/UX modeled on the existing Budgets feature (list + details + bottom-sheet register flow, `ModalView`, `Header` compound, TanStack Query hooks with optimistic mutations).
- Deposits/withdrawals reuse the existing transfer infrastructure (`buildTransferCreatePayload`, `createTransferPair` backend service).
- Net worth inclusion mirrors how the Accounts screen totals non-hidden accounts (virtual accounts must be excluded from the list but NOT from the total — the existing `hide` flag cannot be reused because it excludes both).

---

## Deferred Ideas

- Recurring/scheduled auto-deposits into goals (recurring transactions already exist as a separate feature).
- Goal deadline reminders / notifications (separate roadmap item: "Transaction reminders / notifications").
- Shared/multi-user goals (roadmap: "Multi-user / shared wallet support").
