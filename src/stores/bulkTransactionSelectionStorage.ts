import { create } from 'zustand';

import { TransactionProps } from '@interfaces/transactions';

type BulkTransactionSelection = {
  isSelectionMode: boolean;
  setIsSelectionMode: (isSelectionMode: boolean) => void;
  selectedTransactions: TransactionProps[];
  setSelectedTransactions: (transactions: TransactionProps[]) => void;
  addTransaction: (transaction: TransactionProps) => void;
  removeTransaction: (transactionId: number) => void;
  clearSelection: () => void;
  toggleTransaction: (transaction: TransactionProps) => void;
};

export const useBulkTransactionSelection = create<BulkTransactionSelection>(
  (set, get) => ({
    isSelectionMode: false,
    setIsSelectionMode: (isSelectionMode) =>
      set(() => ({ isSelectionMode: isSelectionMode })),
    selectedTransactions: [],
    setSelectedTransactions: (transactions) =>
      set(() => ({ selectedTransactions: transactions })),
    addTransaction: (transaction) =>
      set((state) => ({
        selectedTransactions: [...state.selectedTransactions, transaction],
      })),
    removeTransaction: (transactionId) =>
      set((state) => ({
        selectedTransactions: state.selectedTransactions.filter(
          (t) => t.id !== transactionId
        ),
      })),
    clearSelection: () =>
      set(() => ({ selectedTransactions: [], isSelectionMode: false })),
    toggleTransaction: (transaction) => {
      const state = get();
      const isSelected = state.selectedTransactions.some(
        (t) => t.id === transaction.id
      );

      if (isSelected) {
        set((state) => ({
          selectedTransactions: state.selectedTransactions.filter(
            (t) => t.id !== transaction.id
          ),
        }));
      } else {
        set((state) => ({
          selectedTransactions: [...state.selectedTransactions, transaction],
        }));
      }
    },
  })
);
