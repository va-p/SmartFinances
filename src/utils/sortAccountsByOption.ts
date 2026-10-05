import { SortingOption } from '@stores/userConfigsStorage';

type SortableAccount = {
  name: string;
  /** Base-currency-normalized numeric balance (computed by processAccountsForList). */
  balanceConvertedToBase: number;
};

const byNameAsc = (a: SortableAccount, b: SortableAccount) =>
  a.name.localeCompare(b.name);
const byNameDesc = (a: SortableAccount, b: SortableAccount) =>
  b.name.localeCompare(a.name);
const byBalanceAsc = (a: SortableAccount, b: SortableAccount) =>
  a.balanceConvertedToBase - b.balanceConvertedToBase;
const byBalanceDesc = (a: SortableAccount, b: SortableAccount) =>
  b.balanceConvertedToBase - a.balanceConvertedToBase;

const COMPARATORS: Record<SortingOption, (a: SortableAccount, b: SortableAccount) => number> = {
  'name-asc': byNameAsc,
  'name-desc': byNameDesc,
  'balance-asc': byBalanceAsc,
  'balance-desc': byBalanceDesc,
};

/**
 * Returns a sorted copy of the given accounts using the same comparators as
 * the Accounts screen: name via localeCompare, balance via the
 * base-currency-normalized numeric value (never the formatted string).
 */
export function sortAccountsByOption<T extends SortableAccount>(
  accounts: T[],
  option: SortingOption
): T[] {
  return [...accounts].sort(COMPARATORS[option]);
}
