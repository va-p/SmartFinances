const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

/**
 * Formats a date as the subscription screens display it, e.g. "06 AGO. 2026"
 * (zero-padded day + uppercase PT-BR month abbreviation with trailing dot +
 * 4-digit year). Accepts a Date or an ISO string.
 */
export function formatSubscriptionDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_ABBREVIATIONS[date.getMonth()];
  return `${day} ${month}. ${date.getFullYear()}`;
}
