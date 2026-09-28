import { filterItemsByQuery } from './filterItemsByQuery';

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
