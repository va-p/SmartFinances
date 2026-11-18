import { filterItemsByQuery } from './filterItemsByQuery';
import type { InvestmentGroup } from './groupInvestments';

type GetSearchText<TItem> = (item: TItem) => string | null | undefined;

type FilterableSection = {
  data: unknown[];
};

/**
 * Client-side search filter for sectioned lists (Account day-groups,
 * InstitutionDetails account sections): filters each section's data with
 * `filterItemsByQuery` and drops sections left with no items, so no
 * section header renders without content. Surviving sections keep their
 * original title/total (Home-screen parity: group totals are not
 * recomputed while searching). An empty query (length 0) returns the
 * sections unfiltered.
 */
export function filterSectionsByQuery<TSection extends FilterableSection>(
  sections: TSection[],
  searchQuery: string,
  getSearchText: GetSearchText<TSection['data'][number]>
): TSection[] {
  if (!searchQuery || searchQuery.length === 0) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      data: filterItemsByQuery(section.data, searchQuery, getSearchText),
    }))
    .filter((section) => section.data.length > 0);
}

/**
 * Searchable text for one investment group (INV-08): the group label
 * plus every member's name, issuer, and rate reference. A query
 * matching any of them surfaces the entire group (Q4).
 */
export function investmentGroupSearchText(group: InvestmentGroup): string {
  const memberText = group.members.flatMap((member) => [
    member.name,
    member.investmentData?.issuer ?? '',
    member.investmentData?.rateType ?? '',
  ]);
  return [group.label, ...memberText].join(' ');
}

/**
 * Whole-group search (INV-08, Q4): a query matching any member name,
 * issuer, or rate label keeps the entire group with stable sums.
 * An empty query returns the groups unchanged.
 */
export function filterInvestmentGroups(
  groups: InvestmentGroup[],
  searchQuery: string
): InvestmentGroup[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return groups;
  }
  const query = searchQuery.trim().toLowerCase();
  return groups.filter((group) =>
    investmentGroupSearchText(group).toLowerCase().includes(query)
  );
}
