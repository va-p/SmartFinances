export type TransferLinkInput = {
  transactionType: string;
  isBulkEdit?: boolean;
  /** Editor id; empty means create mode (no counterpart exists yet). */
  transactionId: string;
  relatedTransactionId: string | number | null | undefined;
};

/**
 * Whether the transfer counterpart link renders (spec transfer-link TLINK-01,
 * TLINK-02, TLINK-04). Transfer legs are the only paired transactions; bulk
 * edit is per-leg; create mode and missing/self links have nothing to open.
 */
export function shouldShowTransferLink(input: TransferLinkInput): boolean {
  if (input.isBulkEdit) {
    return false;
  }
  if (input.transactionType !== 'TRANSFER') {
    return false;
  }
  if (!input.transactionId) {
    return false;
  }
  if (
    input.relatedTransactionId === null ||
    input.relatedTransactionId === undefined ||
    input.relatedTransactionId === ''
  ) {
    return false;
  }
  if (String(input.relatedTransactionId) === String(input.transactionId)) {
    return false;
  }
  return true;
}

/**
 * Counterpart display name with the spec fallback (TLINK-05).
 */
export function resolveTransferLinkTitle(
  counterpartAccountName: string | null | undefined
): string {
  return counterpartAccountName || 'Transferência vinculada';
}

export type CounterpartCandidateInput = {
  id: number | string;
  type: string;
  accountId: number | string;
  relatedTransactionId: number | string | null | undefined;
};

/**
 * Link-picker candidates for attaching a counterpart to a single-leg
 * transfer (spec transfer-correction TRC-19). Only unlinked plain rows of
 * the complementary plain type in another account qualify: the backend
 * flips the pick to its TRANSFER_* side and cross-links with zero balance
 * movement, so linked, same-account, transfer-type, and wrong-side rows
 * are all rejected up front (the backend 404/409/422s stay as backstop).
 */
export function selectCounterpartCandidates<T extends CounterpartCandidateInput>(input: {
  existingSide: 'TRANSFER_CREDIT' | 'TRANSFER_DEBIT';
  ownTransactionId: number | string;
  ownAccountId: number | string;
  transactions: T[];
}): T[] {
  const expectedPlainType =
    input.existingSide === 'TRANSFER_CREDIT' ? 'DEBIT' : 'CREDIT';
  return input.transactions.filter((candidate) => {
    if (candidate.type !== expectedPlainType) return false;
    if (
      candidate.relatedTransactionId !== null &&
      candidate.relatedTransactionId !== undefined
    )
      return false;
    if (String(candidate.id) === String(input.ownTransactionId)) return false;
    if (String(candidate.accountId) === String(input.ownAccountId)) return false;
    return true;
  });
}

/**
 * Screen-level composition for the link picker (TRC-19): adapts
 * `TransactionProps` rows (nested account, snake_case link id) to the
 * candidate predicate and unwraps the original refs. Kept here so the
 * mapping is unit-tested without rendering the register screen.
 */
export type CounterpartSourceRow = {
  id: number | string;
  type: string;
  account?: { id: number | string } | null;
  related_transaction_id?: number | string | null;
};

export function filterCounterpartTransactions<T extends CounterpartSourceRow>(input: {
  existingSide: 'TRANSFER_CREDIT' | 'TRANSFER_DEBIT';
  ownTransactionId: number | string;
  ownAccountId: number | string | null;
  transactions: T[];
}): T[] {
  const candidates = selectCounterpartCandidates({
    existingSide: input.existingSide,
    ownTransactionId: input.ownTransactionId,
    ownAccountId: input.ownAccountId ?? 0,
    transactions: input.transactions.map((row) => ({
      id: row.id,
      type: row.type,
      accountId: row.account?.id ?? 0,
      relatedTransactionId: row.related_transaction_id ?? null,
      ref: row,
    })),
  });
  return candidates.map((candidate) => candidate.ref);
}
