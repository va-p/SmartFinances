# Home Widgets Context

**Gathered:** 2026-11-10
**Spec:** `.specs/features/home-widgets/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Five home-screen widget families (Budgets, Cash Flow, Overview Small, Overview / Control Panel, Net Worth & Accounts) in Small 2x2, Medium 4x2, and Large 4x4 sizes on iOS and Android, rendering a JS-written snapshot with deep links, privacy masking, and offline/signed-out placeholders. No lock-screen/watch widgets, no in-widget creation flows beyond the quick-add entry point.

---

## Implementation Decisions

### Data plumbing (snapshot, not live API)

- JS writes `widget-snapshot.json` to the shared App Group container on app foreground, pull-to-refresh, and after transaction / budget / account mutations.
- Native widgets (WidgetKit / AppWidget) render only the snapshot; timeline refreshes never hit the network.
- Snapshot carries pre-formatted pt-BR strings (`R$ 27.540,00`, `102,48%`) plus raw numbers/arrays for bars, sparkline, and donut.
- Optional follow-up (not MVP): app-level background fetch (BGTask / WorkManager) to refresh the snapshot without opening the app.

### Overview Small Variant A/B selection

- Widget-system configuration on both platforms (iOS AppIntent / Android widget options), not an in-app setting.
- Default is Variant A (red alert card + outlined pill); Variant B (plain text + full-width bar) selectable per widget instance.
- Choice persists across timeline refreshes.

### Tap matrix (accepted as proposed)

- Budget row → budget detail screen; widget header → section home (Budgets list).
- Cash-flow / panel `+` and `Adicionar Despesa` → add-transaction flow.
- `Relatórios` → Overview / Reports screen.
- Patrimony / Overview headers → Accounts / Overview home.

### Privacy visuals (accepted as proposed)

- `hideAmount` in-app toggles the snapshot `hidden` flag; widgets mask totals, alert values, and institution balances as `R$ ••••`.
- Signed-out → locked placeholder prompting to open the app; never financial values.
- Missing/corrupt snapshot → setup placeholder prompting to open the app.

### Ordering rules (user-refined)

- Budgets ordered by highest spend percentage of the current period (`amount_spent / amount` desc), truncated to 3 (Medium) / 6 (Large) — not Budgets-screen order.
- Critical budget / alert = highest spend percentage among non-archived budgets.
- Institutions = top 2 by total balance desc.

### Agent's Discretion

- Exact snapshot schema field names, chart point counts (bars/sparkline/donut slices), and placeholder copy in pt-BR.
- Native chart drawing technique (SwiftUI Charts vs. manual paths; Glance vs. RemoteViews canvas) within the platform chart-orientation constraint (iOS Medium vertical diverging, Android Medium horizontal).
- Deep-link URL scheme details (Expo Router URLs) provided the destinations above hold.

### Declined / Undiscussed Gray Areas → Assumptions

- None declined. All five areas discussed and recorded in the spec assumptions table (all marked confirmed).

---

## Specific References

- Five layout mocks: Orçamentos (3-row Medium / 6-row Grande), Fluxo de Caixa (Pequeno 2x2 + Médio 4x2, Android horizontal vs iOS vertical), Overview Pequeno options (Variante A card vs Variante B plain bar), Overview / Painel (Pequeno/Médio/Grande), Patrimônio e Contas (Pequeno/Médio).
- Dark card, white primary text, green in-limit, coral-red over-limit, orange accent for + and eye.

---

## Deferred Ideas

- None - discussion stayed within feature scope.
