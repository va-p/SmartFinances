import { AccountProps } from '@interfaces/accounts';

/**
 * Whitelisted investment view of Account.providerMetadata (INV-05).
 * Mirrors `mapInvestmentData` in account.controller.ts: only the fields
 * the investment card needs, all strings-or-null as persisted by
 * `upsertInvestmentAccount`.
 */
export type InvestmentDetails = {
  investmentType: string | null;
  investmentSubtype: string | null;
  investmentStatus: string | null;
  rate: string | null;
  rateType: string | null;
  issuer: string | null;
  currentGrossAmount: string | null;
  amountOriginal: string | null;
  amountProfit: string | null;
  currentDate: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
};

export type InvestmentAccount = AccountProps & {
  investmentData?: InvestmentDetails | null;
};

export interface InvestmentGroup {
  key: string;
  label: string;
  investmentType: string | null;
  investmentSubtype: string | null;
  rate: string | null;
  rateType: string | null;
  members: InvestmentAccount[];
  totalBalanceBase: number;
  count: number;
}

function normalizePart(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

/**
 * Group key for one investment position (INV-01).
 * Same product and rate collapse; manual positions (no metadata, or
 * metadata with no grouping fields) get a unique per-account key so
 * they render as ungrouped singles, never collapsed together.
 */
export function buildInvestmentGroupKey(
  account: InvestmentAccount,
  index = 0
): string {
  const details = account.investmentData;
  if (!details) {
    return `manual:${String(account.id ?? index)}`;
  }
  const parts = [
    normalizePart(details.investmentType),
    normalizePart(details.investmentSubtype),
    normalizePart(details.rateType),
    normalizePart(details.rate),
  ];
  if (parts.every((part) => part === '')) {
    return `manual:${String(account.id ?? index)}`;
  }
  return parts.join('|');
}

/**
 * Short group label, e.g. "CDB · 100.00% CDI" (Layout 2 header).
 * Falls back to subtype, then type, then a generic label when the
 * rate side is missing.
 */
export function buildInvestmentGroupLabel(
  details: InvestmentDetails | null | undefined
): string {
  const product =
    details?.investmentSubtype?.trim() ||
    details?.investmentType?.trim() ||
    'Investimento';
  const rate = details?.rate?.trim() ?? '';
  const numericRate = Number(rate);
  const formattedRate =
    rate && Number.isFinite(numericRate) ? numericRate.toFixed(2) : rate;
  const rateType = details?.rateType?.trim() ?? '';
  const rateLabel = [formattedRate && `${formattedRate}%`, rateType]
    .filter(Boolean)
    .join(' ');
  return rateLabel ? `${product} · ${rateLabel}` : product;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Gross profit for the card (Q2): currentGrossAmount - amountOriginal.
 * Null when either leg is missing or unparseable.
 */
export function grossProfitOf(
  details: InvestmentDetails | null | undefined
): number | null {
  const gross = toNumber(details?.currentGrossAmount);
  const original = toNumber(details?.amountOriginal);
  if (gross === null || original === null) {
    return null;
  }
  return gross - original;
}

/**
 * Net profit for the card (Q2): amountProfit when Openi supplies it,
 * else currentNet (account balance) - amountOriginal.
 * Null when no basis exists.
 */
export function netProfitOf(
  details: InvestmentDetails | null | undefined,
  balance: string | number | null | undefined
): number | null {
  const profit = toNumber(details?.amountProfit);
  if (profit !== null) {
    return profit;
  }
  const net = toNumber(balance);
  const original = toNumber(details?.amountOriginal);
  if (net === null || original === null) {
    return null;
  }
  return net - original;
}

/**
 * Collapse same-product positions into groups (INV-01..INV-04).
 * `toBase` converts one member to base currency so the caller reuses
 * the same `convertCurrency` path as InstitutionDetails totals.
 * Order is stable: first-seen group wins, members keep input order.
 */
export function groupInvestments(
  accounts: InvestmentAccount[],
  toBase: (account: InvestmentAccount) => number
): InvestmentGroup[] {
  const groups = new Map<string, InvestmentGroup>();
  accounts.forEach((account, index) => {
    const key = buildInvestmentGroupKey(account, index);
    const existing = groups.get(key);
    if (existing) {
      existing.members.push(account);
      existing.count = existing.members.length;
      existing.totalBalanceBase += toBase(account);
      return;
    }
    const details = account.investmentData ?? null;
    groups.set(key, {
      key,
      label: buildInvestmentGroupLabel(details),
      investmentType: details?.investmentType ?? null,
      investmentSubtype: details?.investmentSubtype ?? null,
      rate: details?.rate ?? null,
      rateType: details?.rateType ?? null,
      members: [account],
      totalBalanceBase: toBase(account),
      count: 1,
    });
  });
  return [...groups.values()];
}
