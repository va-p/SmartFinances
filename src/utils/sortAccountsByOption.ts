import { SortingOption } from '@stores/userConfigsStorage';

type SortableAccount = {
  name: string;
  /** BRL-normalized numeric balance (computed by processAccountsForList). */
  balanceConvertedToBRL: number;
};

const byNameAsc = (a: SortableAccount, b: SortableAccount) =>
  a.name.localeCompare(b.name);
const byNameDesc = (a: SortableAccount, b: SortableAccount) =>
  b.name.localeCompare(a.name);
const byBalanceAsc = (a: SortableAccount, b: SortableAccount) =>
  a.balanceConvertedToBRL - b.balanceConvertedToBRL;
const byBalanceDesc = (a: SortableAccount, b: SortableAccount) =>
  b.balanceConvertedToBRL - a.balanceConvertedToBRL;

const COMPARATORS: Record<SortingOption, (a: SortableAccount, b: SortableAccount) => number> = {
  'name-asc': byNameAsc,
  'name-desc': byNameDesc,
  'balance-asc': byBalanceAsc,
  'balance-desc': byBalanceDesc,
};

/**
 * Returns a sorted copy of the given accounts using the same comparators as
 * the Accounts screen: name via localeCompare, balance via the
 * BRL-normalized numeric value (never the formatted string).
 */
export function sortAccountsByOption<T extends SortableAccount>(
  accounts: T[],
  option: SortingOption
): T[] {
  return [...accounts].sort(COMPARATORS[option]);
}
