import { useCallback } from 'react';
import { Alert } from 'react-native';

import {
  useToggleTransaction,
  useSelectedTransactionsCount,
  useClearSelection,
} from '@stores/useTransactionsStore';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

type UseTransactionHandlersProps = {
  registerTransactionBottomSheetRef: React.RefObject<BottomSheetModal | null>;
  setTransactionId: (id: string) => void;
};

type UseTransactionHandlersReturn = {
  handleOpenTransaction: (id: string) => void;
  handleLongPress: (id: string) => void;
  handleOpenBulkEditModal: () => void;
  clearTransactionId: () => void;
};

export function useTransactionHandlers({
  registerTransactionBottomSheetRef,
  setTransactionId,
}: UseTransactionHandlersProps): UseTransactionHandlersReturn {
  const toggleTransaction = useToggleTransaction();
  const selectedCount = useSelectedTransactionsCount();

  const handleOpenTransaction = useCallback(
    (id: string) => {
      if (selectedCount > 0) {
        // If in selection mode, toggle the transaction selection
        toggleTransaction(Number(id));
        return;
      } else {
        // If not in selection mode, open transaction detail
        setTransactionId(id);
        registerTransactionBottomSheetRef.current?.present();
      }
    },
    [
      selectedCount,
      toggleTransaction,
      setTransactionId,
      registerTransactionBottomSheetRef,
    ]
  );

  const handleLongPress = useCallback(
    (id: string) => {
      toggleTransaction(Number(id));
    },
    [toggleTransaction]
  );

  const handleOpenBulkEditModal = useCallback(() => {
    if (selectedCount === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma transação para editar.');
      return;
    }
    setTransactionId('bulk-edit');
    registerTransactionBottomSheetRef.current?.present();
  }, [selectedCount, setTransactionId, registerTransactionBottomSheetRef]);

  const clearTransactionId = useCallback(() => {
    setTransactionId('');
  }, [setTransactionId]);

  return {
    handleOpenTransaction,
    handleLongPress,
    handleOpenBulkEditModal,
    clearTransactionId,
  };
}
