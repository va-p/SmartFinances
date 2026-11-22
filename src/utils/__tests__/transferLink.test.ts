import {
  filterCounterpartTransactions,
  resolveTransferLinkTitle,
  selectCounterpartCandidates,
  shouldShowTransferLink,
} from '@utils/transferLink';

describe('shouldShowTransferLink', () => {
  const base = {
    transactionType: 'TRANSFER',
    isBulkEdit: false,
    transactionId: '7',
    relatedTransactionId: '9',
  };

  it('shows the link when editing a linked transfer leg (TLINK-01)', () => {
    expect(shouldShowTransferLink(base)).toBe(true);
  });

  it('hides the link for non-transfer types (TLINK-01)', () => {
    expect(
      shouldShowTransferLink({ ...base, transactionType: 'CREDIT' })
    ).toBe(false);
    expect(shouldShowTransferLink({ ...base, transactionType: 'DEBIT' })).toBe(
      false
    );
  });

  it('hides the link in bulk-edit mode (TLINK-02)', () => {
    expect(shouldShowTransferLink({ ...base, isBulkEdit: true })).toBe(false);
  });

  it('hides the link on create, when there is no counterpart yet', () => {
    expect(shouldShowTransferLink({ ...base, transactionId: '' })).toBe(false);
  });

  it('hides the link when the counterpart is missing (TLINK-04)', () => {
    expect(
      shouldShowTransferLink({ ...base, relatedTransactionId: null })
    ).toBe(false);
    expect(
      shouldShowTransferLink({ ...base, relatedTransactionId: undefined })
    ).toBe(false);
    expect(shouldShowTransferLink({ ...base, relatedTransactionId: '' })).toBe(
      false
    );
  });

  it('hides the link when the counterpart id equals the current id', () => {
    expect(
      shouldShowTransferLink({ ...base, relatedTransactionId: '7' })
    ).toBe(false);
  });
});

describe('selectCounterpartCandidates (TRC-19)', () => {
  const candidate = (overrides = {}) => ({
    id: 2,
    type: 'DEBIT',
    accountId: 20,
    relatedTransactionId: null as number | null,
    ...overrides,
  });

  it('keeps unlinked plain DEBIT rows from other accounts for a TRANSFER_CREDIT base', () => {
    const rows = [
      candidate(),
      candidate({ id: 3, type: 'CREDIT' }),
      candidate({ id: 4, type: 'TRANSFER_DEBIT' }),
    ];
    expect(
      selectCounterpartCandidates({
        existingSide: 'TRANSFER_CREDIT',
        ownTransactionId: 1,
        ownAccountId: 10,
        transactions: rows,
      })
    ).toEqual([candidate()]);
  });

  it('keeps unlinked plain CREDIT rows from other accounts for a TRANSFER_DEBIT base', () => {
    const rows = [candidate({ id: 3, type: 'CREDIT' })];
    expect(
      selectCounterpartCandidates({
        existingSide: 'TRANSFER_DEBIT',
        ownTransactionId: 1,
        ownAccountId: 10,
        transactions: rows,
      })
    ).toEqual([candidate({ id: 3, type: 'CREDIT' })]);
  });

  it('rejects linked rows (backend 409 backstop)', () => {
    const rows = [candidate({ relatedTransactionId: 9 })];
    expect(
      selectCounterpartCandidates({
        existingSide: 'TRANSFER_CREDIT',
        ownTransactionId: 1,
        ownAccountId: 10,
        transactions: rows,
      })
    ).toEqual([]);
  });

  it('rejects the own row and same-account rows', () => {
    const rows = [
      candidate({ id: 1 }),
      candidate({ id: 5, accountId: 10 }),
    ];
    expect(
      selectCounterpartCandidates({
        existingSide: 'TRANSFER_CREDIT',
        ownTransactionId: 1,
        ownAccountId: 10,
        transactions: rows,
      })
    ).toEqual([]);
  });

  it('accepts undefined link ids as unlinked', () => {
    const rows = [candidate({ relatedTransactionId: undefined })];
    expect(
      selectCounterpartCandidates({
        existingSide: 'TRANSFER_CREDIT',
        ownTransactionId: 1,
        ownAccountId: 10,
        transactions: rows,
      })
    ).toHaveLength(1);
  });
});

describe('filterCounterpartTransactions (TRC-19)', () => {
  const row = (overrides = {}) => ({
    id: 2,
    type: 'DEBIT',
    account: { id: 20 },
    related_transaction_id: null as number | null,
    description: 'Pix recebido',
    ...overrides,
  });

  it('adapts nested rows and returns the original refs', () => {
    const rows = [row(), row({ id: 3, type: 'CREDIT', account: { id: 30 } })];
    const result = filterCounterpartTransactions({
      existingSide: 'TRANSFER_CREDIT',
      ownTransactionId: '1',
      ownAccountId: '10',
      transactions: rows,
    });

    expect(result).toEqual([rows[0]]);
    expect(result[0]).toBe(rows[0]);
  });

  it('drops rows whose nested account is the own account', () => {
    const result = filterCounterpartTransactions({
      existingSide: 'TRANSFER_DEBIT',
      ownTransactionId: '1',
      ownAccountId: '10',
      transactions: [row({ id: 5, type: 'CREDIT', account: { id: 10 } })],
    });

    expect(result).toEqual([]);
  });

  it('accepts rows missing the link field as unlinked', () => {
    const rows = [{ id: 6, type: 'DEBIT', account: { id: 21 } }];
    const result = filterCounterpartTransactions({
      existingSide: 'TRANSFER_CREDIT',
      ownTransactionId: '1',
      ownAccountId: null,
      transactions: rows,
    });

    expect(result).toHaveLength(1);
  });
});

describe('resolveTransferLinkTitle', () => {
  it('shows the counterpart account name when available (TLINK-05)', () => {
    expect(resolveTransferLinkTitle('Carteira')).toBe('Carteira');
  });

  it('falls back to the generic label when the name is unavailable (TLINK-05)', () => {
    expect(resolveTransferLinkTitle(null)).toBe('Transferência vinculada');
    expect(resolveTransferLinkTitle(undefined)).toBe(
      'Transferência vinculada'
    );
    expect(resolveTransferLinkTitle('')).toBe('Transferência vinculada');
  });
});
