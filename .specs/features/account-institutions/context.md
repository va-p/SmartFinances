# Context — Account Institutions (Discuss Phase)

Captured from user discussion prior to spec.md. This is the resolved gray-area
record; spec.md is the source of truth for requirements.

## Problem statement

Accounts are 100% flat/individual today. A user with a checking account, a CD,
and stocks all at Itaú has no way to see "how much do I have at Itaú" without
manually summing balances. The Accounts screen also gets cluttered as
per-institution account counts grow.

## Rejected approach: hierarchical sub-accounts

A parent/child `Account` tree (self-referencing `parentAccountId`) was
considered and rejected. Reasons:
- Balance rollup ambiguity (derived vs. materialized parent balance)
- Transaction posting ambiguity (which node does a transaction target?)
- Breaks the assumption — used by `Transaction.accountId`, `Budget.accountId`,
  transfers, and credit-card fields — that every `accountId` is a standalone
  balance
- Unbounded nesting solves a problem the user doesn't have (their accounts are
  peers at the same bank, not envelopes drawn from one pool)

## Chosen approach: Institution as a peer grouping entity

A new `Institution` model groups peer `Account` rows by financial institution.
It is decoupled from the existing `BankingIntegration` model (which represents
a Pluggy *sync connection*, not a user-facing grouping label) but the two link
optionally so Pluggy-synced and manually-created accounts at the same bank can
share one Institution.

## Resolved decisions

1. **Institution grouping, not hierarchy** — confirmed.
2. **Required vs. optional**: optional at the schema/data level (nullable FK,
   zero forced migration). UX-required for `BANK`/`INVESTMENTS`/`CREDIT`
   account types during creation (these always have a real institution in
   practice); optional/skippable for `WALLET`/`CRYPTOCURRENCY_WALLET`/`OTHER`
   (cash, self-custody crypto rarely have one).
3. **Where institutions get created**: primarily inline, from a
   "+ Nova instituição" quick-add row inside the institution picker used in
   `RegisterAccount` — but it still creates a real, manageable `Institution`
   row. A dedicated Institutions management screen (mirroring the existing
   `Categories` / `RegisterCategory` pattern) is the durable home for
   renaming/deleting institutions.
4. **Pluggy auto-linking**: connecting a bank via Pluggy finds-or-creates an
   `Institution` matched by `(userId, bankName)` and links the new
   `BankingIntegration` to it. Connecting the same bank twice (two Itaú
   logins) reuses the same `Institution` — never creates a duplicate.
5. **Credit cards stay in their own carousel** (no accordion/grouping into the
   vertical institution list). Phase 1: show the institution name as a small
   label on each `CreditCardListItem`; sort the carousel alphabetically by
   institution name (falling back to account name when ungrouped). Explicitly
   deferred: sub-grouping the carousel by institution with its own subtotals.
6. **Institution rollup total excludes credit cards** — it's a sum of the
   institution's non-credit-card accounts only (checking/savings/investments/
   wallet), converted to the base currency, matching what a single account's
   balance already represents (an asset figure, not a net-of-debt figure).
   Credit cards still carry an `institutionId` and do appear grouped in the
   `InstitutionDetails` screen — just not folded into the headline number.
7. **Main Accounts list**: an institution with 2+ non-credit-card accounts
   collapses into a single **Institution Card** (name + aggregated balance +
   account count), replacing its individual account entries. An institution
   with exactly 1 non-credit-card account **bypasses the wrapper entirely**
   and renders as a normal `AccountListItem` (tap goes straight to the
   account, same as today). Ungrouped accounts (`institutionId: null`) also
   render as normal `AccountListItem`s, unchanged.
8. **Sort order**: alphabetical by display name; institutions first, then
   standalone (ungrouped / single-account) entries.
9. **Institution details screen**: tapping a multi-account Institution Card
   navigates to a new `InstitutionDetails` screen listing every account at
   that institution (including credit cards), grouped by account type/subtype
   section (Conta Corrente, Poupança, Investimentos, Carteira, Criptomoedas,
   Cartões de Crédito). No new backend endpoint is required for phase 1 — the
   screen filters the already-fetched `useAccountsQuery` cache client-side,
   receiving the selected institution via a new lightweight Zustand store
   (mirroring the existing `useCurrentAccountSelected` pattern used by
   `handleOpenAccount`).
10. **Scope of the rollup UI**: Accounts screen only, for now. No other
    screen (Home, Budgets, Reports) needs to change in phase 1 — an account
    keeps showing only its own data everywhere else.
11. **Branding**: phase 1 is name-only. `imageUrl`/color fields are
    deliberately deferred, not scaffolded speculatively now.
12. **No persisted collapse state** — moot now that the accordion idea was
    replaced by navigation to a dedicated details screen.

## Prior art found in the codebase (grounding, not decisions)

- `BankingIntegration` already models "a financial institution" but is
  Pluggy-sync-specific (required `pluggyIntegrationId`, health/status fields)
  — wrong entity to overload for a pure UI-grouping concept.
- `BankingIntegrationDetails` screen is connection-management only (re-auth,
  health status) — it does **not** list accounts, so there's no reuse
  conflict with the new `InstitutionDetails` screen.
- `Category`/`Tag` establish the existing "dedicated management screen +
  Register screen, picker-only in other forms" convention — `Institution`
  follows this, with one deliberate deviation (inline quick-add) justified in
  decision #3 above.
- Credit cards already render in a structurally separate horizontal carousel
  (`Accounts/index.tsx` ~L500-546), distinct from the vertical accounts list
  — consistent with how Mint/Monarch/Copilot Money separate liabilities from
  assets.
