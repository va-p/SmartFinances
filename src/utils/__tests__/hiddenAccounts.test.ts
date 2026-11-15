import {
  excludeHiddenAccountTransactions,
  isHiddenAccountTransaction,
} from '../hiddenAccounts';

describe('isHiddenAccountTransaction', () => {
  // HIDE-01/HIDE-03 — only an explicit hide === true flag hides the row
  it('returns true when account.hide is true', () => {
    expect(isHiddenAccountTransaction({ account: { hide: true } })).toBe(true);
  });

  it('returns false when account.hide is false', () => {
    expect(isHiddenAccountTransaction({ account: { hide: false } })).toBe(
      false,
    );
  });

  it('returns false when the hide flag is missing', () => {
    expect(isHiddenAccountTransaction({ account: {} })).toBe(false);
  });

  it('returns false when account is null', () => {
    expect(isHiddenAccountTransaction({ account: null })).toBe(false);
  });

  it('returns false when account is missing', () => {
    expect(isHiddenAccountTransaction({})).toBe(false);
  });

  it('returns false for truthy non-true hide values', () => {
    expect(
      isHiddenAccountTransaction({
        account: { hide: 'yes' as unknown as boolean },
      }),
    ).toBe(false);
  });
});

describe('excludeHiddenAccountTransactions', () => {
  const visible = { id: 1, account: { hide: false } };
  const hidden = { id: 2, account: { hide: true } };
  const unflagged = { id: 3, account: {} };

  // HIDE-01 — hidden rows drop out, everything else keeps its position
  it('removes hidden rows while preserving order', () => {
    expect(
      excludeHiddenAccountTransactions([visible, hidden, unflagged]),
    ).toEqual([visible, unflagged]);
  });

  it('does not mutate the input array', () => {
    const input = [visible, hidden];
    excludeHiddenAccountTransactions(input);
    expect(input).toEqual([visible, hidden]);
  });

  // Edge case: every account hidden renders empty lists and zero totals
  it('returns an empty array when every row is hidden', () => {
    expect(excludeHiddenAccountTransactions([hidden])).toEqual([]);
  });
});
