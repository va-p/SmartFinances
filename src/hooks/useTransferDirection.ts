import { useState } from 'react';

import {
  resolveConversionDirection,
  TransferDirection,
} from '@utils/transactionPayload';

/**
 * Conversion-direction state for unlinked plain → transfer repair
 * (spec transfer-correction TRC-01/TRC-02/TRC-03). Source mode repairs an
 * imported CREDIT as the credit side; destination mode keeps today's
 * behavior. Linked-transfer edit never uses it (swap scope is conversion
 * only) — the screen gates the swap control on the conversion predicate.
 */
export function useTransferDirection() {
  const [transferDirection, setTransferDirection] =
    useState<TransferDirection>('destination');

  const initConversionDirection = (storedType: string | undefined) =>
    setTransferDirection(resolveConversionDirection(storedType));

  const toggleTransferDirection = () =>
    setTransferDirection((mode) =>
      mode === 'destination' ? 'source' : 'destination'
    );

  return {
    transferDirection,
    initConversionDirection,
    toggleTransferDirection,
  };
}
