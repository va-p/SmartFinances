/**
 * Credit-card form → API payload mapping for manually registered accounts.
 *
 * The backend accepts an optional `creditData` object on account
 * create/update (zod `creditDataSchema`). Of all the card fields the
 * `Account` model has, only these four are captured manually:
 *   - `brand` — free string, max 50 chars
 *   - `balanceCloseDate` — full ISO-8601 datetime string (a date-only
 *     string such as "2026-10-08" is rejected by the backend schema)
 *   - `creditLimit` — non-negative number
 *   - `availableCreditLimit` — non-negative number, optional/nullable
 *
 * The remaining card columns (level, due date, minimum payment, status,
 * holder type, foreign-currency balance, flexible limit) are
 * integration-only (Pluggy/Belvo).
 *
 * The statement closing date is captured as a day of month (1-31) because
 * a manual user knows the recurring closing day, not a calendar date. It
 * is stored as the next occurrence of that day, normalized to UTC midnight
 * so the persisted value is deterministic across device timezones.
 */

export type CreditCardFormValues = {
  brand?: string | null;
  closeDay?: number | string | null;
  creditLimit?: number | string | null;
  availableCreditLimit?: number | string | null;
};

export type CreditCardDataPayload = {
  brand: string;
  balanceCloseDate: string;
  creditLimit: number;
  availableCreditLimit: number | null;
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Builds the statement closing date as the next occurrence of `day`,
 * at UTC midnight. Rolls forward month-by-month when the day does not
 * exist in the target month (Feb 30 → Mar 30) or when this month's
 * occurrence has already passed.
 */
export function buildStatementCloseDate(
  day: number,
  now: Date = new Date()
): Date {
  const closingDay = Math.trunc(day);
  const todayUtcMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();
  let candidate = new Date(Date.UTC(year, month, closingDay));

  // Date.UTC overflows short months (Feb 30 becomes Mar 2), so a stored
  // day that differs from the closing day means the month does not
  // contain it — keep rolling until the day exists and is not in the past.
  while (
    candidate.getUTCDate() !== closingDay ||
    candidate.getTime() < todayUtcMs
  ) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    candidate = new Date(Date.UTC(year, month, closingDay));
  }

  return candidate;
}

/**
 * Extracts the day of month from a stored closing date (edit pre-fill).
 * Accepts the ISO strings the API returns as well as Date instances.
 * Returns null for absent/invalid values so the input stays empty.
 */
export function getClosingDayFromDate(
  value?: string | Date | null
): number | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCDate();
}

/**
 * Maps the card form values to the API `creditData` object.
 * Returns null when any required value (brand, closing day, total
 * limit) is missing — the caller then omits `creditData` from the
 * account payload. `availableCreditLimit` is optional: it is sent as
 * null when empty (the backend persists null).
 */
export function buildCreditCardDataPayload(
  values: CreditCardFormValues,
  now: Date = new Date()
): CreditCardDataPayload | null {
  const brand = values.brand?.trim() ?? '';
  const closeDay = toNumber(values.closeDay);
  const creditLimit = toNumber(values.creditLimit);

  if (!brand || closeDay === null || creditLimit === null) return null;

  return {
    brand,
    balanceCloseDate: buildStatementCloseDate(closeDay, now).toISOString(),
    creditLimit,
    availableCreditLimit: toNumber(values.availableCreditLimit),
  };
}
