# Home Widgets Specification

## Problem Statement

Users cannot see balances, budgets, or cash flow without opening the SmartFinances app. The roadmap lists iOS / Android home-screen widgets as the next item. The attached layouts define five widget families (Budgets, Cash Flow, Overview small with two visual options, Overview / Control Panel, Net Worth & Accounts) in Small (2x2), Medium (4x2), and Large (4x4) sizes for both platforms.

## Goals

- [ ] Ship all five widget families on iOS (WidgetKit) and Android (AppWidget) with the sizes in the layouts
- [ ] Widgets render real user data (budgets, cash flow, net worth, critical budget, institutions) and stay fresh within the platform refresh budget
- [ ] Overview Small supports both visualization options from the separate mock (Variant A card and Variant B plain bar), user-selectable

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Lock-screen / watch / Wear OS widgets | Layouts cover home-screen sizes only |
| Interactive charts inside widgets (scroll, tooltips) | Home-screen widgets are glanceable snapshots; full interactivity stays in-app |
| Creating budgets / editing accounts from inside the widget (except quick-add entry point) | Creation flows stay in-app; widgets deep-link into them |
| Web companion widgets | Mobile home-screen scope only |
| Export data (CSV/PDF) | Separate roadmap item |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Widget sizes map to Small 2x2, Medium 4x2, Large 4x4 on both platforms | Small = systemSmall / 2x2, Medium = systemMedium / 4x2, Large = systemLarge / 4x4 | Layouts label sizes as 2x2, 4x2, 4x4 for both iOS and Android | n |
| Budgets Medium shows 3 budgets, Large shows 6 | Top mock row (3 rows) = Medium, bottom mock row (6 rows) = Large | Top section shows 3 budget rows and bottom shows 6 for both platforms | n |
| Budget ordering in widgets | Ordered by highest spend percentage (`amount_spent / amount`, current period) descending, truncated to size capacity | User decision 2026-11-10 (Guided discuss): order by biggest amount used of the total | y |
| Cash-flow month | Current calendar month in device local time, header shows month name in pt-BR | Layouts show "Novembro Fluxo de Caixa" with monthly totals | n |
| Data source is a JS-written snapshot | App writes a `widget-snapshot.json` to the shared App Group container on every relevant store/query refresh; native widgets render only that snapshot | User decision 2026-11-10: snapshot JSON in shared App Group (live API rejected: credential sharing, Swift/Kotlin logic duplication, OS refresh budgets, backend load) | y |
| Snapshot freshness | Snapshot written on app foreground, on pull-to-refresh, and after create/edit of transaction, budget, or account; widgets also use OS timeline refresh (iOS) / periodic update (Android 30-60 min) | Balances widgets freshness against OS refresh budgets and battery | n |
| Unauthenticated / logged-out state | Widgets SHALL show a locked placeholder prompting to open the app | User decision 2026-11-10: locked placeholder accepted | y |
| Hide-amounts (eye icon) | Tapping the eye in-app toggles the snapshot's `hidden` flag; widgets render masked values (`R$ ••••`) when hidden | User decision 2026-11-10: masked values accepted | y |
| Overview Small default variant | Variant A (red alert card) is the default; Variant B (plain bar) is selectable via widget-system config (iOS AppIntent / Android widget options) | User decision 2026-11-10: widget-system config, default A | y |
| Critical budget definition | The non-archived budget with the highest spend percentage in the current period | User decision 2026-11-10: biggest amount used of the total | y |
| Institution ordering in widget | Top 2 institutions by total balance descending (sum of their non-hidden accounts) | User decision 2026-11-10: accepted as proposed | y |
| Chart rendering in widgets | Native-drawn simple bars/lines from snapshot arrays, not WebView or screenshot of RN charts | Widget extensions cannot host the app's Gifted-Charts views | n |
| Android Medium cash-flow orientation | Horizontal bars per the Android mock; iOS Medium uses vertical diverging bars | Layouts deliberately differ per platform for the Medium cash-flow chart | n |
| Currency formatting | Snapshot carries pre-formatted pt-BR strings from `formatCurrency` plus raw numbers; widgets display the strings as-is | Guarantees identical "R$ 27.540,00" / "102,48%" rendering without duplicating formatting natively | n |
| Tap targets | Tapping a widget section deep-links into the matching app screen (budget row to budget detail, + to add transaction, Relatórios to Overview/Reports, header to section home) | User decision 2026-11-10: tap matrix accepted as proposed | y |
| Minimum OS versions | iOS 17+ (WidgetKit, AppIntent configuration) and Android 8+ (AppWidgetProvider, Glance where available with RemoteViews fallback) | Covers the installed base while keeping one implementation path per platform | n |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Budgets widget (Orçamentos) ⭐ MVP

**User Story**: As a user, I want my budget consumption on the home screen so that I see overruns without opening the app.

**Why P1**: Core layout family; directly shows value and drives retention.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN the Budgets widget renders THEN the system SHALL show the header "Orçamentos" with the target icon.
2. WHEN a budget is within limit THEN the system SHALL render a green progress bar labeled with the spend percent and the text "R$ X restantes".
3. WHEN a budget exceeds 100% THEN the system SHALL render a coral-red progress bar labeled with the percent and the text "Estourado! -R$ Y".
4. WHERE the platform is iOS the system SHALL render a chevron affordance on each budget row.
5. WHEN the Medium size renders THEN the system SHALL show exactly the first 3 budgets in list order.
6. WHEN the Large size renders THEN the system SHALL show exactly the first 6 budgets in list order.
7. WHEN fewer budgets exist than the size capacity THEN the system SHALL render only the existing budgets with no empty placeholder rows.
8. IF no budgets exist THEN the system SHALL render an empty state prompting to create a budget in the app.
9. WHILE data is stale or loading the system SHALL keep the last snapshot visible rather than blanking the widget.
10. The system SHALL render identical budget content on iOS and Android for the same snapshot and size.

**Independent Test**: Seed 4 budgets (one over 100%), render Medium (3 rows incl. one "Estourado!") and Large (all 4, no fillers), then delete all budgets and confirm the empty state.

---

### P1: Cash-flow widget (Fluxo de Caixa) ⭐ MVP

**User Story**: As a user, I want this month's income vs. expenses on the home screen so that I track the month at a glance.

**Why P1**: Second layout family; highest-glance value alongside net worth.

**Acceptance Criteria**:

1. WHEN the cash-flow widget renders THEN the system SHALL show the current month name plus "Fluxo de Caixa", "Receitas R$ X" in green, and "Despesas -R$ Y" in coral-red.
2. WHEN the Small size renders THEN the system SHALL show a compact paired income/expense mini bar chart plus the orange circular + button.
3. WHEN the iOS Medium size renders THEN the system SHALL show vertical diverging bars with income above and expenses below the axis plus the + button.
4. WHERE the platform is Android Medium the system SHALL render horizontal income/expense bars instead of vertical bars.
5. WHEN the user taps the + button THEN the system SHALL deep-link into the app's add-transaction flow.
6. IF the month has no transactions THEN the system SHALL show R$ 0,00 totals with an empty-chart placeholder rather than an error.

**Independent Test**: Seed November with R$ 6.450,00 income and -R$ 4.890,12 expenses; verify Small and Medium on both platforms match the layout values and chart orientations, and + opens add-transaction.

---

### P1: Overview Small widget with two visualization options ⭐ MVP

**User Story**: As a user, I want a compact net-worth widget with a critical-budget alert so that I see wealth plus risk in 2x2.

**Why P1**: The separate mock mandates two Small options; both platforms need both.

**Acceptance Criteria**:

1. WHEN the Overview Small widget renders THEN the system SHALL show the header "Overview" with the eye icon, "Patrimônio Total", and the formatted total.
2. WHERE Variant A is selected the system SHALL render the coral-red alert card containing "Alerta: {name}" and "{percent}%" with the outlined mini progress pill.
3. WHERE Variant B is selected the system SHALL render plain "Alerta: {name}" text plus "{percent}%" with a full-width coral-red progress bar and no card background.
4. WHEN the user changes the widget option THEN the system SHALL persist the chosen variant and render it on the next timeline refresh.
5. WHEN hide-amounts is on THEN the system SHALL mask the total and alert values in both variants.
6. IF no budget exceeds 80% THEN the system SHALL hide the alert section and show only the total.

**Independent Test**: With total R$ 27.540,00 and Moradia at 102,48%, render Variant A (card) and Variant B (plain bar) side by side on iOS and Android and confirm both match the option mock.

---

### P1: Overview / Control Panel Medium and Large ⭐ MVP

**User Story**: As a user, I want medium and large control-panel widgets so that I get critical-budget context and shortcuts without opening the app.

**Why P1**: Completes the Overview family shown in the layouts.

**Acceptance Criteria**:

1. WHEN the Medium size renders THEN the system SHALL show "Overview", "Patrimônio Total" with total on the left and the "Orçamento Crítico: {name}" card with "{percent}% utilizado" bar on the right.
2. WHEN the Medium size renders THEN the system SHALL show the bottom action row with the + button and the "Relatórios" button.
3. WHEN the Large size renders THEN the system SHALL show the title "Painel de Controle", "Patrimônio Total" with total, the orange net-worth sparkline, the critical-budget card with percent bar, and the expenses-by-category donut.
4. WHEN the Large size renders THEN the system SHALL show the bottom action row with "+ Adicionar Despesa" and "Relatórios".
5. WHEN the user taps + or Adicionar Despesa THEN the system SHALL deep-link into add-transaction.
6. WHEN the user taps Relatórios THEN the system SHALL deep-link into the Overview/Reports screen.

**Independent Test**: Seed critical budget Moradia e Contas at 102,48%; render Medium (card + two buttons) and Large (sparkline + donut + labeled actions) and tap each action to confirm deep links.

---

### P1: Net-worth & Accounts widget (Patrimônio e Contas) ⭐ MVP

**User Story**: As a user, I want net worth plus top institutions on the home screen so that I see where money sits.

**Why P1**: Fifth layout family; mirrors the Accounts screen value prop.

**Acceptance Criteria**:

1. WHEN the widget renders THEN the system SHALL show "Patrimônio Total" with the eye icon and the formatted total.
2. WHEN accounts exist THEN the system SHALL list the top institutions with bank icon, institution name, "{n} contas", and formatted balance (e.g. Nubank 5 contas R$ 4.250,10, Itaú 3 contas R$ 1.890,45).
3. WHEN the Small size renders THEN the system SHALL show exactly the top 2 institutions with no chart.
4. WHEN the Medium size renders THEN the system SHALL show the same institution rows plus the orange net-worth evolution sparkline.
5. WHEN hide-amounts is on THEN the system SHALL mask the total and every institution balance.
6. IF no accounts exist THEN the system SHALL show the total as R$ 0,00 with an empty-accounts prompt.

**Independent Test**: Seed Nubank (5 accounts) and Itaú (3 accounts); verify Small shows 2 rows without chart and Medium adds the sparkline with identical balances.

---

### P2: Freshness, privacy, and resilience

**User Story**: As a user, I want widgets to stay current and never leak data so that I trust them on the lock-adjacent home screen.

**Why P2**: Non-functional glue across all five families; ships with P1 but tested separately.

**Acceptance Criteria**:

1. WHEN the app refreshes budgets, transactions, or accounts THEN the system SHALL rewrite the shared widget snapshot within 5 seconds.
2. WHILE the device is offline the system SHALL keep rendering the last snapshot with no error state.
3. WHILE the user is signed out the system SHALL render the locked placeholder instead of any financial values.
4. WHEN the OS requests a widget timeline refresh THEN the system SHALL return the latest snapshot in under 2 seconds without a network call.
5. IF the snapshot is missing or corrupt THEN the system SHALL render the setup placeholder prompting to open the app.

**Independent Test**: Go offline (stale data stays), sign out (locked placeholder), corrupt snapshot file (setup placeholder), then sign in and refresh (fresh values within 5s).

---

### P3: Visual fidelity and empty states

**User Story**: As a user, I want widgets to match the dark-theme mocks so that they feel native to the app.

**Why P3**: Polish after correctness; keeps MVP shippable without pixel-perfection gating.

**Acceptance Criteria**:

1. The system SHALL render all widgets on the dark card background with white primary text, muted secondary text, green in-limit bars, coral-red over-limit bars, and the orange accent for + and eye affordances.
2. IF a budget name is too long for its row THEN the system SHALL truncate it with a tail ellipsis on one line.

**Independent Test**: Render "Moradia e Contas" plus a 40-character budget name on Small/Medium and confirm one-line truncation with no overlap.

---

## Edge Cases

Edge cases are usually unwanted-behavior (IF/THEN) or boundary (WHEN) criteria:

- IF snapshot write fails (shared container unavailable) THEN system SHALL retain the previous snapshot and retry on next app refresh.
- IF more budgets exist than fit THEN system SHALL truncate to size capacity (3 Medium / 6 Large) with no scroll inside the widget.
- WHEN base currency is non-BRL THEN system SHALL display the snapshot's pre-formatted strings unchanged.
- IF institution list exceeds size capacity THEN system SHALL show the top 2 by balance.
- WHEN the critical budget changes between refreshes THEN system SHALL update the alert and critical card on the next timeline refresh.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| WDG-01 | P1: Budgets header + target icon | Design | Pending |
| WDG-02 | P1: Budgets in-limit green row | Implementing | T2 |
| WDG-03 | P1: Budgets over-limit red row | Implementing | T2 |
| WDG-04 | P1: Budgets iOS chevron | Design | Pending |
| WDG-05 | P1: Budgets Medium 3 rows | Implementing | T2 |
| WDG-06 | P1: Budgets Large 6 rows | Implementing | T2 |
| WDG-07 | P1: Budgets short-list no fillers | Implementing | T2 |
| WDG-08 | P1: Budgets empty state | Implementing | T2 |
| WDG-09 | P1: Budgets stale-while-revalidate | Design | Pending |
| WDG-10 | P1: Budgets iOS/Android parity | Design | Pending |
| WDG-11 | P1: Cash-flow header + totals | Implementing | T3 |
| WDG-12 | P1: Cash-flow Small chart + button | Implementing | T3 data, T8/T9 chrome |
| WDG-13 | P1: Cash-flow iOS Medium vertical bars | Design | Pending |
| WDG-14 | P1: Cash-flow Android Medium horizontal bars | Design | Pending |
| WDG-15 | P1: Cash-flow + deep link | Design | Pending |
| WDG-16 | P1: Cash-flow empty month | Implementing | T3 |
| WDG-17 | P1: Overview Small header + total | Implementing | T3 data, T8/T9 chrome |
| WDG-18 | P1: Overview Small Variant A card | Design | Pending |
| WDG-19 | P1: Overview Small Variant B plain bar | Design | Pending |
| WDG-20 | P1: Overview Small variant persistence | Design | Pending |
| WDG-21 | P1: Overview Small hide-amounts | Design | Pending |
| WDG-22 | P1: Overview Small no-alert state | Implementing | T3 |
| WDG-23 | P1: Control Panel Medium card + actions | Design | Pending |
| WDG-24 | P1: Control Panel Medium action row | Design | Pending |
| WDG-25 | P1: Control Panel Large sparkline + donut | Design | Pending |
| WDG-26 | P1: Control Panel Large labeled actions | Design | Pending |
| WDG-27 | P1: Control Panel add-expense deep link | Design | Pending |
| WDG-28 | P1: Control Panel reports deep link | Design | Pending |
| WDG-29 | P1: Patrimony header + total | Implementing | T3 data, T8/T9 chrome |
| WDG-30 | P1: Patrimony institution rows | Implementing | T3 |
| WDG-31 | P1: Patrimony Small 2 rows no chart | Implementing | T3 data, T8/T9 chrome |
| WDG-32 | P1: Patrimony Medium sparkline | Design | Pending |
| WDG-33 | P1: Patrimony hide-amounts | Implementing | T3 |
| WDG-34 | P1: Patrimony empty state | Implementing | T3 |
| WDG-35 | P2: Snapshot write on refresh | Implementing | T4 hook, T5 bridge, T7 wiring |
| WDG-36 | P2: Offline last-snapshot | Design | Pending |
| WDG-37 | P2: Signed-out locked placeholder | Implementing | T4 hook, T8/T9 chrome |
| WDG-38 | P2: Timeline refresh without network | Design | Pending |
| WDG-39 | P2: Missing/corrupt snapshot placeholder | Design | Pending |
| WDG-40 | P3: Dark-theme fidelity | Design | Pending |
| WDG-41 | P3: Long-name truncation | Design | Pending |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 41 total, 0 mapped to tasks, 41 unmapped ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] All five families render on a real iOS device and a real Android device in every mocked size with the spec'd values (budgets incl. Estourado!, R$ 6.450,00 / -R$ 4.890,12, R$ 27.540,00, Moradia 102,48%, Nubank/Itaú rows)
- [ ] Overview Small offers both Variant A and Variant B on both platforms and persists the choice
- [ ] Tapping +, Adicionar Despesa, Relatórios, and budget rows opens the matching app screen
- [ ] Widgets survive offline, signed-out, and corrupt-snapshot states with the spec'd placeholders and masked values when hidden

---

## Tips

- **P1 = Vertical Slice** - A complete, demo-able feature, not just backend or frontend
- **EARS is code** - If you can't write a criterion as a test, rewrite it; pick the pattern (WHEN / WHILE / WHERE / IF / ubiquitous) that fits
- **Requirement IDs are mandatory** - Every story maps to trackable IDs
- **Edge cases matter** - What breaks? What's empty? What's huge?
- **Out of Scope prevents creep** - If it's not here, it doesn't get built
- **Closure gate before confirm** - Three checks: unambiguity + precision, open-questions/assumptions closure, declined gray areas logged; scope-tiered; never invents requirements
- **Confirm after the gate passes** - Present the spec for user confirmation only after the closure gate passes (no unresolved-and-unmarked items remain) and `validate_spec.py` exits clean; user approves spec before moving to discuss phase
