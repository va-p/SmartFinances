import { pickDefaultAccount } from '../pickDefaultAccount';

import { AccountProps } from '../../interfaces/accounts';

const plain = (id: number): AccountProps =>
  ({
    id,
    name: `Conta ${id}`,
    type: 'WALLET',
    balance: 100,
    initialAmount: null,
    currency: { id: 1, name: 'Real Brasileiro', code: 'BRL', symbol: 'R$' },
  }) as AccountProps;

describe('pickDefaultAccount', () => {
  // AC-5: the flagged account is picked
  it('returns the account flagged as default', () => {
    const accounts = [
      plain(1),
      { ...plain(2), isDefault: true },
      plain(3),
    ];
    expect(pickDefaultAccount(accounts)?.id).toBe(2);
  });

  // AC-7: no default configured → undefined (current behavior)
  it('returns undefined when no account is default', () => {
    expect(pickDefaultAccount([plain(1), plain(2)])).toBeUndefined();
  });

  it('returns undefined for an empty list', () => {
    expect(pickDefaultAccount([])).toBeUndefined();
  });

  it('returns undefined for an undefined list (loading state)', () => {
    expect(pickDefaultAccount(undefined)).toBeUndefined();
  });

  // Deterministic: first flagged account wins if data is inconsistent
  it('returns the first default when multiple are flagged', () => {
    const accounts = [
      { ...plain(1), isDefault: true },
      { ...plain(2), isDefault: true },
    ];
    expect(pickDefaultAccount(accounts)?.id).toBe(1);
  });

  // isDefault false must not count as flagged
  it('ignores accounts explicitly flagged false', () => {
    const accounts = [
      { ...plain(1), isDefault: false },
      plain(2),
    ];
    expect(pickDefaultAccount(accounts)).toBeUndefined();
  });
});
