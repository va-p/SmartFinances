type GetSearchText<TItem> = (item: TItem) => string | null | undefined;

/**
 * Client-side search filter for flat lists (Home-screen semantics):
 * case-insensitive substring match on a per-item search field.
 * An empty query (length 0) returns the items unfiltered, and items
 * whose search field is null/undefined never match a non-empty query.
 */
export function filterItemsByQuery<TItem>(
  items: TItem[],
  searchQuery: string,
  getSearchText: GetSearchText<TItem>
): TItem[] {
  if (!searchQuery || searchQuery.length === 0) {
    return items;
  }

  const query = searchQuery.toLowerCase();

  return items.filter((item) =>
    getSearchText(item)?.toLowerCase().includes(query)
  );
}
