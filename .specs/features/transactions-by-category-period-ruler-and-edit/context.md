# Context — transactions-by-category-period-ruler-and-edit

User decisions for gray areas (2026-08-18):

- **D1 — Period selector modal:** INCLUDE. The category screen gets a
  `ChartPeriodSelect` modal (months / years / all), matching Home/Account.
- **D2 — Years source (years mode):** years where THIS category has
  transactions (plus the selected year), not global data.
- **D3 — Card press behavior:** tap always opens the `RegisterTransaction`
  edit modal. No long-press, no bulk-selection on this screen.
