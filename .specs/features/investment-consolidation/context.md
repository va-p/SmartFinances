# Investment Consolidation Context

**Gathered:** 2026-11-15
**Spec:** `.specs/features/investment-consolidation/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Collapse same-product INVESTMENTS positions within one institution into collapsible groups keyed by `investmentType + investmentSubtype + rateType + rate`, without changing the existing section structure (Contas, Poupança, Investimentos, Carteira, Criptomoedas, Cartões). Group rows show rate, profit, and maturity; tapping a group opens the existing Account screen in group mode listing its members; tapping a member opens the normal single-account transaction view.

---

## Implementation Decisions

### Group interaction (Q1)

- Collapsible group rows in `InstitutionDetails` INVESTMENTS section.
- Tap behavior is dual: chevron/expand reveals summary inline AND tap opens the Account screen in group mode (user requirement: "continuar abrindo a tela Account como ocorre com qualquer conta normal").
- Group header shows summed balance + position count; expanded state shows up to N member preview rows.

### Card content and profit (Q2)

- Card shows `rate` + `rateType` (e.g. "100% CDI") plus profit.
- Gross profit = `currentGrossAmount - amountOriginal` when both present.
- Net profit preferred when computable: `amountProfit` when present, else `currentNetAmount - amountOriginal` when both present.
- When neither profit basis exists, show balance only (no "null", no crash).
- Maturity from `expiresAt` shown as short date chip; omitted when null/unparseable.

### Section and navigation preservation (Q3)

- `SECTION_ORDER`, `SECTION_TITLES`, and `getSectionKey` stay unchanged; grouping happens only inside the INVESTMENTS section data array.
- Navigation reuses the existing route `/accounts/[accountId]`:
  - Group tap sets `currentAccountSelected` with a group payload (`accountId: "group:<key>"`, member id list) and navigates to Account screen.
  - Account screen in group mode lists member accounts (each row navigates to single-account mode).
  - Single-account mode is unchanged (transaction list, cash flow, edit).
- No new top-level route; no DB row merge; totals preserved by summing legs.

### Search scope (Q4)

- Entire matching group surfaces: WHEN the query matches any member name, issuer, or rate label THEN the whole group renders (expanded or auto-expanded to the match).
- `filterSectionsByQuery` gains a group-aware matcher; non-investment sections keep exact current behavior.

### Agent's Discretion

- Exact chip styling, date format locale, and expand/collapse animation duration.
- Whether group preview shows 3 members + "+N" or full member list inline (default: 3 + count, full list lives on the Account group screen).
- Profit label wording ("Rendimento bruto/líquido" vs "+R$ X") pending layout pick.

### Declined / Undiscussed Gray Areas → Assumptions

- None declined; all four areas answered. Manual-bucket placement from spec assumptions confirmed by Q3: manual INVESTMENTS without `providerMetadata` render as ungrouped singles at the end of the INVESTMENTS section.

---

## Specific References

- User screenshots: 38 identical "CDB - NU FINANCEIRA S.A. ..." rows; expectation is a handful of groups (one per distinct product/rate).
- User formula: gross = `currentGrossAmount - amountOriginal`; net preferred if Openi data allows (it does: `amountProfit` / `currentNetAmount` / taxes persisted).
- User constraint in caps: "A FORMA COMO A LISTA DAS CONTAS É HOJE NÃO DEVE SER ALTERADA!" — sections stay, grouping only collapses repeats.

---

## Deferred Ideas

- Cross-institution aggregation (e.g. all CDI 100% across Nubank + Itaú in one view).
- Editable rate/maturity for manual positions.
- Per-group performance chart (evolution of grouped balance over time).
