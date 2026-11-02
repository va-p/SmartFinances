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
  return counterpartAccountName
    ? counterpartAccountName
    : 'Transferência vinculada';
}
