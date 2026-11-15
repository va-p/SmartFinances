# Investment Consolidation Specification

## Problem Statement

Every investment position synced from the bank becomes its own `Account` row of type INVESTMENTS. One Nubank connection shows 38 accounts; most rows share the identical name "CDB - NU FINANCEIRA S.A. ..." (caixinhas pockets are an in-bank segmentation, one CDB position per pocket). The InstitutionDetails screen lists each position flat under "Investimentos", which is unusable. The backend already persists everything needed to group and label (`Account.providerMetadata`: `investmentType`, `investmentSubtype`, `rate`, `rateType`, `expiresAt`, gross/net amounts), but `getAccounts`/`getAccountById` never expose it, and the frontend `AccountProps` has no investment fields, so the card can only show name + balance.

## Goals

- [ ] Investment positions under one institution collapse into a small number of meaningful groups instead of ~38 flat rows.
- [ ] Each investment row shows rate reference (`rateType`), rate, and maturity (`expiresAt`) without opening the account.
- [ ] Three concrete card-layout options are presented and one is chosen before implementation.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Changing bank-side caixinhas segmentation | Bank owns pocket structure; app only changes presentation |
| Editing rate/maturity locally | Provider-synced fields are read-only; manual edit is separate work |
| Cross-institution aggregation | Grouping applies within one `InstitutionDetails` institution only |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Group key | Group by `investmentType + investmentSubtype + rateType + rate` | User explicitly suggested `rateType + rate` plus type/subtype to compare; name alone is useless (all identical) | y |
| Data availability | Backend SHALL expose `providerMetadata` investment fields on the accounts payload | Fields already persisted in `upsertInvestmentAccount`; only the read contract is missing | y |
| Manual INVESTMENTS accounts | Accounts without `providerMetadata` render in an "Outros / Manual" bucket ungrouped | No rate/maturity exists to group on; must not vanish | n |
| Group count vs pockets | Grouping is presentational; it does not merge DB rows or alter balances | Totals stay exact; only the list collapses | y |
| Layout choice | Three layouts proposed in Design; user picks one before Tasks | User explicitly requested three layout options for the investment card | y |
| Search behavior | Search filters within groups and matches name, issuer, and rate label | `filterSectionsByQuery` currently matches name only; grouped view must stay searchable | n |

**Open questions:** none - rows marked n need user confirmation during Discuss (manual bucket placement, search scope).

---

## User Stories

### P1: Grouped investment list ⭐ MVP

**User Story**: As a Nubank investor with dozens of caixinhas, I want same-product positions grouped so that the institution screen is scannable.

**Why P1**: 38 identical rows are the reported pain; grouping is the fix.

**Acceptance Criteria**:

1. WHEN `InstitutionDetails` renders INVESTMENTS for one institution THEN the system SHALL render one collapsible group row per distinct `investmentType + investmentSubtype + rateType + rate` key instead of one flat row per position.
2. WHILE a group is collapsed the system SHALL display the summed balance and the position count for that group.
3. WHEN the user expands a group THEN the system SHALL list the member positions with their individual balances.
4. The system SHALL preserve the institution patent total: the sum of group balances equals the previous flat-list sum.

**Independent Test**: Nubank with 30 identical CDB 100%-CDI positions shows 1 group "CDB · 100% CDI (30)" with the correct summed balance; expanding reveals 30 legs.

---

### P2: Informative investment card

**User Story**: As an investor, I want rate, reference, and maturity on the card so that I compare positions without opening each one.

**Why P2**: Name + balance alone cannot distinguish identical-name positions.

**Acceptance Criteria**:

1. WHEN an investment row renders (group header or member) THEN the system SHALL display `rateType`, `rate`, and maturity date (`expiresAt`) when present in `providerMetadata`.
2. IF `rate`, `rateType`, or `expiresAt` is null THEN the system SHALL omit that chip/line rather than rendering "null" or crashing.
3. WHERE the account is manual (no `providerMetadata`) the system SHALL render the existing name + balance card unchanged.

**Independent Test**: CDB row shows "CDI 100%" and "Venc. 12/2028"; a manual Investimento row shows no chips and no crash.

---

### P3: Search and count stay correct

**User Story**: As a user with many positions, I want search and counts to keep working after grouping so that I can still find a pocket.

**Why P3**: Grouping must not break the existing search bar.

**Acceptance Criteria**:

1. WHEN a search query matches a member name or issuer THEN the system SHALL surface its group with the group expanded or filtered to the match.
2. The system SHALL display the true position count per group (e.g. "38 contas" roll-up stays consistent with grouped members).

**Independent Test**: Searching "700,06" surfaces the group containing that leg.

---

## Edge Cases

- IF all positions in an institution share one group key THEN the system SHALL render a single group, not an empty list.
- IF `expiresAt` is an unparseable date THEN the system SHALL omit the maturity chip rather than crashing.
- WHEN balances are in mixed currencies THEN the system SHALL convert each leg to base currency before summing the group header (same `convertCurrency` path as today).
- IF `providerMetadata` is missing entirely THEN the system SHALL route the account to the manual bucket, never drop it.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| INV-01 | P1: group by type+subtype+rateType+rate | Design | Verified |
| INV-02 | P1: collapsed header shows sum + count | Design | Verified |
| INV-03 | P1: expand reveals members | Design | Verified |
| INV-04 | P1: totals preserved | Design | Verified |
| INV-05 | P2: card shows rateType, rate, maturity | Design | Verified |
| INV-06 | P2: null fields omitted | Design | Verified |
| INV-07 | P2: manual accounts unchanged | Design | Verified |
| INV-08 | P3: search surfaces matching groups | Design | Verified |
| INV-09 | P3: counts stay consistent | Design | Verified |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 9 total, 0 mapped to tasks, 9 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Nubank institution screen drops from ~38 flat rows to a handful of groups (one per distinct product/rate).
- [ ] Each group/member shows rate reference, rate, and maturity without opening the account.
- [ ] Institution total and per-group sums reconcile to the cent with the pre-grouping total.
