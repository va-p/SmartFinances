import {
  resolveTransferLinkTitle,
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
